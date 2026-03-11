const ProductModel = require('../models/product.model');

const StockService = {
  async getAllProducts() {
    return ProductModel.getAll();
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
  }
};

module.exports = StockService;
