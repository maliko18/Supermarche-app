const pool = require("../db/connection");

const ProductModel = {
  async getAll(filters = {}) {
    const {
      categorie,
      prixMin,
      prixMax,
      quantiteMin,
      quantiteMax,
      disponibilite,
      sortBy,
      sortOrder,
      search,
    } = filters;

    const conditions = [];
    const values = [];

    if (categorie) {
      conditions.push("p.categorie_id = ?");
      values.push(categorie);
    }

    if (prixMin != null && prixMin !== "") {
      conditions.push("p.prix >= ?");
      values.push(Number(prixMin));
    }

    if (prixMax != null && prixMax !== "") {
      conditions.push("p.prix <= ?");
      values.push(Number(prixMax));
    }

    if (quantiteMin != null && quantiteMin !== "") {
      conditions.push("p.quantite >= ?");
      values.push(Number(quantiteMin));
    }

    if (quantiteMax != null && quantiteMax !== "") {
      conditions.push("p.quantite <= ?");
      values.push(Number(quantiteMax));
    }

    if (disponibilite === "en_stock") {
      conditions.push("p.quantite > 0");
    } else if (disponibilite === "faible") {
      conditions.push("p.quantite <= p.seuil_alerte AND p.quantite > 0");
    } else if (disponibilite === "rupture") {
      conditions.push("p.quantite = 0");
    }

    if (search) {
      conditions.push(
        '(LOWER(p.nom) LIKE ? OR LOWER(c.nom) LIKE ? OR LOWER(IFNULL(p.code_barres, "")) LIKE ?)',
      );
      const searchLike = `%${String(search).toLowerCase()}%`;
      values.push(searchLike, searchLike, searchLike);
    }

    const sortableFields = {
      nom: "p.nom",
      prix: "p.prix",
      quantite: "p.quantite",
    };
    const safeSortBy = sortableFields[sortBy] || "p.nom";
    const safeSortOrder =
      String(sortOrder).toUpperCase() === "DESC" ? "DESC" : "ASC";

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const [rows] = await pool.query(
      `SELECT p.*, c.nom AS categorie_nom
       FROM produits p
       LEFT JOIN categories c ON p.categorie_id = c.id
       ${whereClause}
       ORDER BY ${safeSortBy} ${safeSortOrder}`,
      values,
    );
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query(
      `SELECT p.*, c.nom AS categorie_nom 
       FROM produits p 
       LEFT JOIN categories c ON p.categorie_id = c.id 
       WHERE p.id = ?`,
      [id],
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
      [categorieId],
    );
    return rows;
  },

  async create({
    nom,
    prix,
    quantite,
    seuil_alerte,
    code_barres,
    emplacement,
    categorie_id,
  }) {
    const [result] = await pool.query(
      `INSERT INTO produits (nom, prix, quantite, seuil_alerte, code_barres, emplacement, categorie_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        nom,
        prix,
        quantite,
        seuil_alerte || 10,
        code_barres,
        emplacement,
        categorie_id,
      ],
    );
    return {
      id: result.insertId,
      nom,
      prix,
      quantite,
      seuil_alerte,
      code_barres,
      emplacement,
      categorie_id,
    };
  },

  async update(
    id,
    {
      nom,
      prix,
      quantite,
      seuil_alerte,
      code_barres,
      emplacement,
      categorie_id,
    },
  ) {
    await pool.query(
      `UPDATE produits 
       SET nom = ?, prix = ?, quantite = ?, seuil_alerte = ?, code_barres = ?, emplacement = ?, categorie_id = ? 
       WHERE id = ?`,
      [
        nom,
        prix,
        quantite,
        seuil_alerte,
        code_barres,
        emplacement,
        categorie_id,
        id,
      ],
    );
    return {
      id,
      nom,
      prix,
      quantite,
      seuil_alerte,
      code_barres,
      emplacement,
      categorie_id,
    };
  },

  async delete(id) {
    const [result] = await pool.query("DELETE FROM produits WHERE id = ?", [
      id,
    ]);
    return result.affectedRows > 0;
  },

  async getLowStock() {
    const [rows] = await pool.query(
      `SELECT p.*, c.nom AS categorie_nom 
       FROM produits p 
       LEFT JOIN categories c ON p.categorie_id = c.id 
       WHERE p.quantite <= p.seuil_alerte 
       ORDER BY p.quantite ASC`,
    );
    return rows;
  },

  async getStockSummary() {
    const [total] = await pool.query("SELECT COUNT(*) AS total FROM produits");
    const [lowStock] = await pool.query(
      "SELECT COUNT(*) AS count FROM produits WHERE quantite <= seuil_alerte",
    );
    const [byCategorie] = await pool.query(
      `SELECT c.nom AS categorie, COUNT(p.id) AS nb_produits, SUM(p.quantite) AS stock_total
       FROM categories c
       LEFT JOIN produits p ON c.id = p.categorie_id
       GROUP BY c.id, c.nom`,
    );
    const [alertProducts] = await pool.query(
      `SELECT p.nom, p.quantite, p.seuil_alerte, c.nom AS categorie
       FROM produits p
       LEFT JOIN categories c ON p.categorie_id = c.id
       WHERE p.quantite <= p.seuil_alerte
       ORDER BY p.quantite ASC`,
    );
    return {
      total_produits: total[0].total,
      produits_en_alerte: lowStock[0].count,
      par_categorie: byCategorie,
      alertes: alertProducts,
    };
  },

  async getAllCategories() {
    const [rows] = await pool.query("SELECT * FROM categories ORDER BY nom");
    return rows;
  },

  async ensureLogsTable() {
    await pool.query(
      `CREATE TABLE IF NOT EXISTS stock_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        action VARCHAR(20) NOT NULL,
        produit_id INT NULL,
        produit_nom VARCHAR(255) NOT NULL,
        actor VARCHAR(100) DEFAULT 'StockManager',
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
    );
  },

  async logAction({ action, produit_id, produit_nom, actor, details }) {
    await this.ensureLogsTable();
    await pool.query(
      `INSERT INTO stock_logs (action, produit_id, produit_nom, actor, details)
       VALUES (?, ?, ?, ?, ?)`,
      [
        action,
        produit_id || null,
        produit_nom,
        actor || "StockManager",
        details || null,
      ],
    );
  },

  async getLogs(limit = 50) {
    await this.ensureLogsTable();
    const safeLimit = Number.isFinite(Number(limit))
      ? Math.min(Math.max(Number(limit), 1), 200)
      : 50;
    const [rows] = await pool.query(
      `SELECT id, action, produit_id, produit_nom, actor, details, created_at
       FROM stock_logs
       ORDER BY created_at DESC
       LIMIT ?`,
      [safeLimit],
    );
    return rows;
  },

  async findMentionedInQuestion(question, limit = 5) {
    const safeLimit = Number.isFinite(Number(limit))
      ? Math.min(Math.max(Number(limit), 1), 10)
      : 5;

    const normalizedQuestion = String(question || "").toLowerCase();
    const [rows] = await pool.query(
      `SELECT p.id, p.nom, p.quantite, p.seuil_alerte, p.prix, p.emplacement, c.nom AS categorie_nom
       FROM produits p
       LEFT JOIN categories c ON p.categorie_id = c.id
       WHERE LOWER(?) LIKE CONCAT('%', LOWER(p.nom), '%')
       ORDER BY CHAR_LENGTH(p.nom) DESC
       LIMIT ?`,
      [normalizedQuestion, safeLimit],
    );

    return rows;
  },
};

module.exports = ProductModel;
