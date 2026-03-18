const ProductModel = require("../models/product.model");

const StockService = {
  async getAllProducts(filters) {
    return ProductModel.getAll(filters);
  },

  async getProductById(id) {
    return ProductModel.getById(id);
  },

  async getProductsByCategorie(categorieId) {
    return ProductModel.getByCategorie(categorieId);
  },

  async createProduct(data) {
    return ProductModel.create(data);
  },

  async updateProduct(id, data) {
    return ProductModel.update(id, data);
  },

  async deleteProduct(id) {
    return ProductModel.delete(id);
  },

  async getLowStockProducts() {
    return ProductModel.getLowStock();
  },

  async getStockSummary() {
    return ProductModel.getStockSummary();
  },

  async getAllCategories() {
    return ProductModel.getAllCategories();
  },

  async logProductAction(data) {
    return ProductModel.logAction(data);
  },

  async getJournal(limit) {
    return ProductModel.getLogs(limit);
  },

  async getMentionedProducts(question, limit = 5) {
    return ProductModel.findMentionedInQuestion(question, limit);
  },
};

module.exports = StockService;
