const AIService = require("../services/ai.service");

const AIController = {
  async chat(req, res) {
    try {
      const { question } = req.body;
      if (!question) {
        return res.status(400).json({ error: "La question est obligatoire" });
      }
      const reponse = await AIService.analyserStock(question);
      res.json({ reponse });
    } catch (error) {
      const status = error.statusCode || 500;
      res.status(status).json({
        error: "Erreur lors de la communication avec l'IA",
        details: error.message || "Erreur inconnue",
      });
    }
  },

  async recommandations(req, res) {
    try {
      const reponse = await AIService.recommanderReapprovisionnement();
      res.json({ reponse });
    } catch (error) {
      const status = error.statusCode || 500;
      res.status(status).json({
        error: "Erreur lors de la génération des recommandations",
        details: error.message || "Erreur inconnue",
      });
    }
  },
};

module.exports = AIController;
