CREATE DATABASE IF NOT EXISTS supermarche_stock CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE supermarche_stock;

CREATE TABLE IF NOT EXISTS categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nom VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS produits (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nom VARCHAR(255) NOT NULL,
  prix DECIMAL(10,2) NOT NULL,
  quantite INT NOT NULL DEFAULT 0,
  seuil_alerte INT DEFAULT 10,
  code_barres VARCHAR(50),
  emplacement VARCHAR(50),
  categorie_id INT,
  FOREIGN KEY (categorie_id) REFERENCES categories(id)
);

-- Données initiales : catégories (selon maquettes)
INSERT INTO categories (nom) VALUES
  ('Produits Frais'),
  ('Épicerie Sucrée'),
  ('Épicerie Salée'),
  ('Boissons'),
  ('Hygiène & Beauté'),
  ('Entretien & Maison'),
  ('Boulangerie & Pâtisserie'),
  ('Surgelés');

-- Données initiales : produits
INSERT INTO produits (nom, prix, quantite, seuil_alerte, code_barres, emplacement, categorie_id) VALUES
  ('Lait Demi-écrémé 1L', 1.20, 450, 50, '3216549871230', 'Rayon A-12', 1),
  ('Yaourt Nature x12', 3.50, 60, 15, '3216549871231', 'Rayon A-14', 1),
  ('Beurre Doux 250g', 2.30, 8, 10, '3216549871232', 'Rayon A-15', 1),
  ('Fromage Emmental 200g', 2.80, 35, 10, '3216549871233', 'Rayon A-16', 1),
  ('Chocolat Noir 200g', 2.50, 100, 20, '3216549871234', 'Rayon B-01', 2),
  ('Confiture Fraise 350g', 3.10, 45, 10, '3216549871235', 'Rayon B-02', 2),
  ('Biscuits Petit Beurre', 1.80, 70, 15, '3216549871236', 'Rayon B-03', 2),
  ('Céréales Muesli 500g', 4.20, 30, 10, '3216549871237', 'Rayon B-04', 2),
  ('Pâtes Penne 500g', 1.20, 100, 20, '3216549871238', 'Rayon C-01', 3),
  ('Riz Basmati 1kg', 2.50, 7, 15, '3216549871239', 'Rayon C-02', 3),
  ('Huile d''Olive 1L', 5.90, 40, 10, '3216549871240', 'Rayon C-03', 3),
  ('Sauce Tomate 500g', 1.60, 55, 15, '3216549871241', 'Rayon C-04', 3),
  ('Lait Demi-écrémé 1L', 0.95, 150, 25, '3216549871242', 'Rayon D-01', 4),
  ('Jus d''Orange Bio 1L', 2.10, 0, 20, '3216549871243', 'Rayon D-02', 4),
  ('Eau Minérale 1.5L', 0.60, 500, 40, '3216549871244', 'Rayon D-03', 4),
  ('Soda Cola 33cl', 1.20, 12, 20, '3216549871245', 'Rayon D-04', 4),
  ('Shampooing 250ml', 3.90, 40, 10, '3216549871246', 'Rayon E-01', 5),
  ('Savon Liquide 500ml', 2.90, 55, 10, '3216549871247', 'Rayon E-02', 5),
  ('Dentifrice 75ml', 2.20, 65, 15, '3216549871248', 'Rayon E-03', 5),
  ('Lessive Liquide 2L', 7.50, 4, 10, '3216549871249', 'Rayon F-01', 6),
  ('Éponges x3', 1.50, 80, 20, '3216549871250', 'Rayon F-02', 6),
  ('Nettoyant Multi-Surface', 3.20, 30, 10, '3216549871251', 'Rayon F-03', 6),
  ('Baguette Tradition', 1.10, 200, 30, '3216549871252', 'Rayon G-01', 7),
  ('Croissants x6', 2.80, 45, 10, '3216549871253', 'Rayon G-02', 7),
  ('Pain de Mie 500g', 1.90, 60, 15, '3216549871254', 'Rayon G-03', 7),
  ('Pizza Surgelée x3', 4.50, 40, 10, '3216549871255', 'Rayon H-01', 8),
  ('Glace Vanille 1L', 3.80, 25, 8, '3216549871256', 'Rayon H-02', 8),
  ('Légumes Surgelés 1kg', 2.90, 35, 10, '3216549871257', 'Rayon H-03', 8);
