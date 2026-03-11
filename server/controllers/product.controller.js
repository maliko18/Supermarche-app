const StockService = require('../services/stock.service');

const ProductController = {
  async getAll(req, res) {
    try {
      const { categorie } = req.query;
      const products = categorie
        ? await StockService.getProductsByCategorie(categorie)
        : await StockService.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération des produits' });
    }
  },

  async getById(req, res) {
    try {
      const product = await StockService.getProductById(req.params.id);
      if (!product) return res.status(404).json({ error: 'Produit non trouvé' });
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération du produit' });
    }
  },

  async create(req, res) {
    try {
      const { nom, prix, quantite, seuil_alerte, code_barres, emplacement, categorie_id } = req.body;
      if (!nom || prix == null || quantite == null) {
        return res.status(400).json({ error: 'Nom, prix et quantité sont obligatoires' });
      }
      const product = await StockService.createProduct({
        nom, prix, quantite, seuil_alerte, code_barres, emplacement, categorie_id
      });
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la création du produit' });
    }
  },

  async update(req, res) {
    try {
      const { nom, prix, quantite, seuil_alerte, code_barres, emplacement, categorie_id } = req.body;
      if (!nom || prix == null || quantite == null) {
        return res.status(400).json({ error: 'Nom, prix et quantité sont obligatoires' });
      }
      const product = await StockService.updateProduct(req.params.id, {
        nom, prix, quantite, seuil_alerte, code_barres, emplacement, categorie_id
      });
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la mise à jour du produit' });
    }
  },

  async delete(req, res) {
    try {
      const deleted = await StockService.deleteProduct(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'Produit non trouvé' });
      res.json({ message: 'Produit supprimé avec succès' });
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la suppression du produit' });
    }
  },

  async getLowStock(req, res) {
    try {
      const products = await StockService.getLowStockProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération des alertes stock' });
    }
  },

  async getCategories(req, res) {
    try {
      const categories = await StockService.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération des catégories' });
    }
  }
};

module.exports = ProductController;
