const axios = require("axios");
const StockService = require("./stock.service");

const AIService = {
  async analyserStock(question) {
    const context = await StockService.getStockSummary();

    const systemPrompt = `Tu es un assistant intelligent de gestion de stock pour un supermarché.
Voici l'état actuel du stock :

- Nombre total de produits : ${context.total_produits}
- Produits en alerte (stock faible) : ${context.produits_en_alerte}

Répartition par catégorie :
${context.par_categorie.map((c) => `  - ${c.categorie} : ${c.nb_produits} produits, ${c.stock_total} unités en stock`).join("\n")}

Produits en alerte de réapprovisionnement :
${context.alertes.map((a) => `  - ${a.nom} (${a.categorie}) : ${a.quantite} restants (seuil : ${a.seuil_alerte})`).join("\n")}

Réponds uniquement en lien avec ces données de stock. Sois concis et pratique dans tes recommandations.`;

    const response = await axios.post(
      process.env.AI_BASE_URL ||
        "https://api.groq.com/openai/v1/chat/completions",
      {
        model: process.env.AI_MODEL || "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      },
      {
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
