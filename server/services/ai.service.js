const axios = require("axios");
const StockService = require("./stock.service");

const CACHE_TTL_MS = Number(process.env.AI_STOCK_CACHE_MS || 15000);
const MAX_ALERTS_IN_PROMPT = Number(process.env.AI_MAX_ALERTS || 10);

let stockSummaryCache = {
  expiresAt: 0,
  value: null,
};

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

RÈGLES :
- Réponds uniquement sur la base des données ci-dessus.
- Donne au maximum 5 points.
- Propose des actions concrètes.
- Si une question ne concerne pas le stock, rappelle poliment ton rôle.`;

    const response = await axios.post(
      process.env.AI_BASE_URL ||
        "https://api.groq.com/openai/v1/chat/completions",
      {
        model: process.env.AI_MODEL || "llama3.2:3b",
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
          Authorization: `Bearer ${process.env.AI_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    return response.data.choices[0].message.content;
  },

  async recommanderReapprovisionnement() {
    const question =
      "Quels produits dois-je réapprovisionner en priorité ? Donne-moi une liste ordonnée avec les quantités suggérées.";
    return this.analyserStock(question);
  },
};

module.exports = AIService;
