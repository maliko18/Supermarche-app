# Guide d'installation — Application de gestion de stock

Voici une version claire et bien expliquée, étape par étape.

## Avant de commencer — Ce qu'il faut avoir installé

Avant de toucher au projet, assure-toi que ces 4 outils sont présents sur ta machine Windows :

- Node.js 18+ — le moteur qui fait tourner le backend JavaScript
- npm — le gestionnaire de paquets, installé automatiquement avec Node.js
- MySQL 8.x (ou via WampServer / XAMPP) — la base de données
- Git — pour récupérer le projet depuis GitHub

## Étape 1 — Récupérer le projet

Ouvre un terminal et tape :

```bash
git clone https://github.com/maliko18/Supermarche-app.git
cd Supermarche-app
```

Cela télécharge le projet sur ta machine et te place dedans.

## Étape 2 — Installer les dépendances

Le projet est divisé en deux parties : `server` (backend) et `client` (frontend). Chacune a ses propres librairies à installer.

### Terminal 1 — Backend

```bash
cd server
npm install
```

### Terminal 2 — Frontend

```bash
cd client
npm install
```

## Étape 3 — Préparer la base de données

La base de données s'appelle `supermarche_stock`. Il faut la créer en exécutant le script SQL fourni dans le projet (`server/db/init.sql`).

### Option A — Via WampServer (ligne de commande)

1. Lance **WampServer** (icône verte dans la barre des tâches).
2. Vérifie que **MySQL** est bien actif.
3. Ouvre **PowerShell** à la racine du projet (dossier `Supermarche-app`).
4. Exécute la commande suivante (en adaptant le chemin si ta version MySQL est différente) :

```powershell
& "C:\wamp64\bin\mysql\mysql8.4.7\bin\mysql.exe" -u root --default-character-set=utf8mb4 -e "source C:/Users/malik/OneDrive/Documents/M1 IM/s2/agile/developement/gestion de stock/server/db/init.sql"
```

5. Si tout est correct, la base `supermarche_stock` et les tables sont créées automatiquement.

Commandes utiles de vérification :

```powershell
& "C:\wamp64\bin\mysql\mysql8.4.7\bin\mysql.exe" -u root -e "SHOW DATABASES;"
& "C:\wamp64\bin\mysql\mysql8.4.7\bin\mysql.exe" -u root -e "USE supermarche_stock; SHOW TABLES;"
```

En cas d'erreur "fichier introuvable" :

- vérifie le chemin de `mysql.exe` dans `C:\wamp64\bin\mysql\`
- remplace `mysql8.4.7` par le dossier installé sur ta machine
- vérifie que le chemin du script `init.sql` est correct

### Option B — Via phpMyAdmin (plus simple)

1. Va sur http://localhost/phpmyadmin
2. Onglet Importer
3. Sélectionne le fichier `server/db/init.sql`
4. Clique sur Exécuter

## Étape 4 — Configurer le backend

Crée (ou modifie) le fichier `server/.env` avec ces informations :

```dotenv
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=supermarche_stock
DB_PORT=3306

AI_API_KEY=ollama
AI_MODEL=llama3.2:3b
AI_BASE_URL=http://localhost:11434/v1/chat/completions
AI_MAX_TOKENS=250
AI_TEMPERATURE=0.3
AI_STOCK_CACHE_MS=15000
AI_MAX_ALERTS=10
AI_TIMEOUT_MS=30000
```

## Étape 5 — Lancer l'application

Il faut trois terminaux ouverts en même temps.

### Terminal 1 — Ollama (obligatoire pour l'IA)

```bash
ollama serve
```

Garde ce terminal ouvert : le chat IA ne fonctionne pas si Ollama n'est pas lancé.

### Terminal 2 — Backend

```bash
cd server
npm run dev
```

Le backend démarre sur http://localhost:3001

### Terminal 3 — Frontend

```bash
cd client
npm run dev
```

Le frontend démarre sur l'URL affichée par Vite (en général http://localhost:5173).
