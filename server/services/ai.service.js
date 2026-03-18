const axios = require("axios");
const StockService = require("./stock.service");

const CACHE_TTL_MS = Number(process.env.AI_STOCK_CACHE_MS || 15000);
const MAX_ALERTS_IN_PROMPT = Number(process.env.AI_MAX_ALERTS || 10);

let stockSummaryCache = {
  expiresAt: 0,
  value: null,
};

function createAIError(message, statusCode = 500) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function isLocalOllama(baseUrl) {
  return typeof baseUrl === "string" && baseUrl.includes("localhost:11434");
}

async function getCachedStockSummary() {
  const now = Date.now();
  if (stockSummaryCache.value && now < stockSummaryCache.expiresAt) {
    return stockSummaryCache.value;
  }

  const summary = await StockService.getStockSummary();
  stockSummaryCache = {
    value: summary,
    expiresAt: now + CACHE_TTL_MS,
  };
  return summary;
}

const AIService = {
  async analyserStock(question) {
    const context = await getCachedStockSummary();
    const produitsMentionnes = await StockService.getMentionedProducts(
      question,
      5,
    );

    const alertesCritiques = context.alertes.slice(0, MAX_ALERTS_IN_PROMPT);

    const alertesText =
      alertesCritiques.length > 0
        ? alertesCritiques
            .map(
              (a) =>
                `  • ${a.nom} (${a.categorie}) : ${a.quantite} unités restantes / seuil : ${a.seuil_alerte}`,
            )
            .join("\n")
        : "  Aucun produit en alerte.";

    const produitsMentionnesText =
      produitsMentionnes.length > 0
        ? produitsMentionnes
            .map(
              (p) =>
                `  • ${p.nom} (${p.categorie_nom}) : ${p.quantite} unités, seuil ${p.seuil_alerte}, prix ${p.prix}€, emplacement ${p.emplacement || "N/A"}`,
            )
            .join("\n")
        : "  Aucun produit explicitement identifié dans la question.";

    const systemPrompt = `Tu es un assistant de gestion de stock. Réponds en français, court et actionnable.

ÉTAT DU STOCK :
- Total produits référencés : ${context.total_produits}
- Produits en alerte de stock : ${context.produits_en_alerte}

TOP CATÉGORIES :
${context.par_categorie
  .slice(0, 6)
  .map(
    (c) =>
      `  • ${c.categorie} : ${c.nb_produits} produits, ${c.stock_total} unités`,
  )
  .join("\n")}

ALERTES PRIORITAIRES :
${alertesText}

PRODUITS MENTIONNÉS DANS LA QUESTION :
${produitsMentionnesText}

RÈGLES :
- Réponds uniquement sur la base des données ci-dessus.
- Si un produit est listé dans "PRODUITS MENTIONNÉS DANS LA QUESTION", donne sa quantité exacte.
- Donne au maximum 5 points.
- Propose des actions concrètes.
- Si une question ne concerne pas le stock, rappelle poliment ton rôle.`;

    const baseUrl =
      process.env.AI_BASE_URL ||
      "https://api.groq.com/openai/v1/chat/completions";
    const model = process.env.AI_MODEL || "llama-3.3-70b-versatile";
    const apiKey = process.env.AI_API_KEY;

    if (!apiKey) {
      throw createAIError(
        "Clé API manquante. Définissez AI_API_KEY dans server/.env.",
        500,
      );
    }

    try {
      const response = await axios.post(
        baseUrl,
        {
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: question },
          ],
          max_tokens: Number(process.env.AI_MAX_TOKENS || 250),
          temperature: Number(process.env.AI_TEMPERATURE || 0.3),
        },
        {
          timeout: Number(process.env.AI_TIMEOUT_MS || 30000),
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        },
      );

      const answer = response?.data?.choices?.[0]?.message?.content;
      if (!answer) {
        throw createAIError(
          "Réponse IA invalide. Vérifiez AI_MODEL et AI_BASE_URL.",
          502,
        );
      }

      return answer;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
          if (isLocalOllama(baseUrl)) {
            throw createAIError(
              "Service IA local indisponible. Lancez Ollama avec `ollama serve` puis vérifiez le modèle configuré.",
              503,
            );
          }
          throw createAIError(
            "Service IA inaccessible. Vérifiez AI_BASE_URL et votre connexion réseau.",
            503,
          );
        }

        if (error.code === "ECONNABORTED") {
          throw createAIError(
            "Délai d'attente dépassé lors de l'appel IA. Réessayez ou augmentez AI_TIMEOUT_MS.",
            504,
          );
        }

        const status = error.response?.status;
        if (status === 401 || status === 403) {
          throw createAIError(
            "Authentification IA échouée. Vérifiez AI_API_KEY.",
            502,
          );
        }

        if (status === 404) {
          throw createAIError(
            "Endpoint IA introuvable. Vérifiez AI_BASE_URL.",
            502,
          );
        }
      }

      if (error.statusCode) {
        throw error;
      }

      throw createAIError(
        "Erreur IA inattendue. Vérifiez la configuration IA.",
        500,
      );
    }
  },

  async recommanderReapprovisionnement() {
    const question =
      "Quels produits dois-je réapprovisionner en priorité ? Donne-moi une liste ordonnée avec les quantités suggérées.";
    return this.analyserStock(question);
  },
};

module.exports = AIService;
