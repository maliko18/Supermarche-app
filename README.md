# 🛒 Gestion de Stock Supermarché

Application web de gestion de stock pour supermarché avec assistant IA intégré.

**Stack technique :** React (Vite) · Express.js · MySQL · API Groq (LLaMA 3.3)

---

## 📋 Fonctionnalités

- **8 catégories** de produits (Produits Frais, Épicerie, Boissons, Surgelés, etc.)
- **CRUD complet** sur les produits (ajout, modification, suppression)
- **Alertes de stock** automatiques (badges En stock / Faible / Rupture)
- **Assistant IA** intégré pour analyser le stock et recommander les réapprovisionnements
- **Interface responsive** adaptée mobile et desktop

---

## 🚀 Installation

### Prérequis

- [Node.js](https://nodejs.org/) v18+
- [MySQL](https://dev.mysql.com/downloads/) 8.x (ou [WampServer](https://www.wampserver.com/) / XAMPP)
- Un compte [Groq](https://console.groq.com/) (gratuit) pour la clé API IA

### 1. Cloner le projet

```bash
git clone https://github.com/<votre-utilisateur>/gestion-stock-supermarche.git
cd gestion-stock-supermarche
```

### 2. Installer les dépendances

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3. Configurer la base de données MySQL

Assurez-vous que MySQL est lancé, puis exécutez le script d initialisation :

**Avec PowerShell (Windows/Wamp) :**
```powershell
& "C:\wamp64\bin\mysql\mysql8.4.7\bin\mysql.exe" -u root --default-character-set=utf8mb4 -e "source C:/chemin/vers/le/projet/server/db/init.sql"
```

**Avec un terminal Linux/Mac :**
```bash
mysql -u root -p --default-character-set=utf8mb4 < server/db/init.sql
```

**Avec phpMyAdmin :**
1. Ouvrir http://localhost/phpmyadmin
2. Onglet Importer
3. Sélectionner le fichier server/db/init.sql
4. Cliquer sur Exécuter

Cela crée la base supermarche_stock avec les tables categories et produits pré-remplies.

### 4. Configurer les variables d environnement

Créer un fichier server/.env :

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=supermarche_stock
DB_PORT=3306

AI_API_KEY=gsk_VOTRE_CLE_GROQ_ICI
AI_MODEL=llama-3.3-70b-versatile
AI_BASE_URL=https://api.groq.com/openai/v1/chat/completions
```

> 💡 **Obtenir une clé Groq :** Créez un compte sur [console.groq.com](https://console.groq.com), puis allez dans API Keys → Create API Key.

### 5. Lancer l application

Ouvrez **deux terminaux** :

```bash
# Terminal 1 — Backend (port 3001)
cd server
npm run dev

# Terminal 2 — Frontend (port 5173)
cd client
npm run dev
```

Ouvrir **http://localhost:5173** dans le navigateur.

---

## 📁 Structure du projet

```
gestion-stock-supermarche/
├── client/                          # Frontend React (Vite)
│   ├── index.html
│   ├── vite.config.js               # Proxy /api → localhost:3001
│   ├── package.json
│   └── src/
│       ├── main.jsx                 # Point d entrée
│       ├── App.jsx                  # Router (3 pages)
│       ├── App.css                  # Styles globaux
│       ├── pages/
│       │   ├── Home.jsx             # Grille des 8 catégories
│       │   ├── ProductList.jsx      # Tableau produits + chat IA
│       │   └── ProductDetail.jsx    # Détail produit + CRUD + chat IA
│       ├── components/
│       │   ├── AIChat.jsx           # Panneau assistant IA réutilisable
│       │   └── ProductForm.jsx      # Formulaire ajout/modification
│       └── services/
│           └── api.js               # Appels HTTP (axios)
│
└── server/                          # Backend Express + MySQL
    ├── app.js                       # Point d entrée (port 3001)
    ├── .env                         # Variables d env (non commité)
    ├── package.json
    ├── db/
    │   ├── connection.js            # Pool MySQL (utf8mb4, 20 connexions)
    │   └── init.sql                 # Script création DB + données initiales
    ├── models/
    │   └── product.model.js         # Requêtes SQL paramétrées
    ├── services/
    │   ├── stock.service.js         # Logique métier stock
    │   └── ai.service.js            # Intégration API Groq + contexte stock
    ├── controllers/
    │   ├── product.controller.js    # CRUD produits
    │   └── ai.controller.js         # Chat IA + recommandations
    └── routes/
        ├── product.routes.js        # GET/POST/PUT/DELETE /api/produits
        └── ai.routes.js             # POST /api/ai/chat, GET /api/ai/recommandations
```

---

## 🔌 API Endpoints

### Produits

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | /api/produits | Liste tous les produits |
| GET | /api/produits?categorie=1 | Produits par catégorie |
| GET | /api/produits/categories | Liste des catégories |
| GET | /api/produits/alertes | Produits en stock faible |
| GET | /api/produits/:id | Détail d un produit |
| POST | /api/produits | Créer un produit |
| PUT | /api/produits/:id | Modifier un produit |
| DELETE | /api/produits/:id | Supprimer un produit |

### Intelligence Artificielle

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | /api/ai/chat | Poser une question à l IA (body: { "question": "..." }) |
| GET | /api/ai/recommandations | Obtenir des recommandations de réapprovisionnement |

---

## 🗄️ Base de données

### Table categories

| Colonne | Type | Description |
|---------|------|-------------|
| id | INT AUTO_INCREMENT | Identifiant |
| nom | VARCHAR(100) | Nom de la catégorie |

### Table produits

| Colonne | Type | Description |
|---------|------|-------------|
| id | INT AUTO_INCREMENT | Identifiant |
| nom | VARCHAR(255) | Nom du produit |
| prix | DECIMAL(10,2) | Prix unitaire |
| quantite | INT | Quantité en stock |
| seuil_alerte | INT (défaut: 10) | Seuil de réapprovisionnement |
| code_barres | VARCHAR(50) | Code-barres EAN |
| emplacement | VARCHAR(50) | Rayon / emplacement |
| categorie_id | INT (FK) | Référence vers categories.id |

---

## 🤖 Assistant IA

L assistant utilise l API **Groq** (modèle LLaMA 3.3 70B) avec injection de contexte côté serveur :

1. Avant chaque requête IA, le serveur récupère un résumé du stock (produits en alerte, répartition par catégorie)
2. Ce contexte est injecté dans le system prompt pour ancrer les réponses dans les données réelles
3. L IA ne peut répondre qu en lien avec le stock actuel (pas d hallucinations)

---

## ⚠️ Notes importantes

- Le fichier .env contient votre clé API — **ne le commitez jamais** (il est dans .gitignore)
- L encodage de la base doit être **utf8mb4** pour supporter les accents français
- WampServer doit être **démarré** avant de lancer le backend
- Le proxy Vite redirige /api vers le backend — pas besoin de configurer CORS en dev

---

## 👥 Auteurs

Projet réalisé dans le cadre du M1 Informatique — Méthodes Agiles.

