const pool = require('../db/connection');

const ProductModel = {
  async getAll() {
    const [rows] = await pool.query(
      `SELECT p.*, c.nom AS categorie_nom 
       FROM produits p 
       LEFT JOIN categories c ON p.categorie_id = c.id 
       ORDER BY p.nom`
    );
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query(
      `SELECT p.*, c.nom AS categorie_nom 
       FROM produits p 
       LEFT JOIN categories c ON p.categorie_id = c.id 
       WHERE p.id = ?`,
      [id]
    );
    return rows[0];
  },

  async getByCategorie(categorieId) {
    const [rows] = await pool.query(
      `SELECT p.*, c.nom AS categorie_nom 
       FROM produits p 
       LEFT JOIN categories c ON p.categorie_id = c.id 
       WHERE p.categorie_id = ? 
       ORDER BY p.nom`,
      [categorieId]
    );
    return rows;
  },

  async create({ nom, prix, quantite, seuil_alerte, code_barres, emplacement, categorie_id }) {
    const [result] = await pool.query(
      `INSERT INTO produits (nom, prix, quantite, seuil_alerte, code_barres, emplacement, categorie_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nom, prix, quantite, seuil_alerte || 10, code_barres, emplacement, categorie_id]
    );
    return { id: result.insertId, nom, prix, quantite, seuil_alerte, code_barres, emplacement, categorie_id };
  },

  async update(id, { nom, prix, quantite, seuil_alerte, code_barres, emplacement, categorie_id }) {
    await pool.query(
      `UPDATE produits 
       SET nom = ?, prix = ?, quantite = ?, seuil_alerte = ?, code_barres = ?, emplacement = ?, categorie_id = ? 
       WHERE id = ?`,
      [nom, prix, quantite, seuil_alerte, code_barres, emplacement, categorie_id, id]
    );
    return { id, nom, prix, quantite, seuil_alerte, code_barres, emplacement, categorie_id };
  },

  async delete(id) {
    const [result] = await pool.query('DELETE FROM produits WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  async getLowStock() {
    const [rows] = await pool.query(
      `SELECT p.*, c.nom AS categorie_nom 
       FROM produits p 
       LEFT JOIN categories c ON p.categorie_id = c.id 
       WHERE p.quantite <= p.seuil_alerte 
       ORDER BY p.quantite ASC`
    );
    return rows;
  },

  async getStockSummary() {
    const [total] = await pool.query('SELECT COUNT(*) AS total FROM produits');
    const [lowStock] = await pool.query(
      'SELECT COUNT(*) AS count FROM produits WHERE quantite <= seuil_alerte'
    );
    const [byCategorie] = await pool.query(
      `SELECT c.nom AS categorie, COUNT(p.id) AS nb_produits, SUM(p.quantite) AS stock_total
       FROM categories c
       LEFT JOIN produits p ON c.id = p.categorie_id
       GROUP BY c.id, c.nom`
    );
    const [alertProducts] = await pool.query(
      `SELECT p.nom, p.quantite, p.seuil_alerte, c.nom AS categorie
       FROM produits p
       LEFT JOIN categories c ON p.categorie_id = c.id
       WHERE p.quantite <= p.seuil_alerte
       ORDER BY p.quantite ASC`
    );
    return {
      total_produits: total[0].total,
      produits_en_alerte: lowStock[0].count,
      par_categorie: byCategorie,
      alertes: alertProducts
    };
  },

  async getAllCategories() {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY nom');
    return rows;
  }
};

module.exports = ProductModel;
