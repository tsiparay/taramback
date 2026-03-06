# Taram CMS Back (Node.js + Express + SQLite)

## Description

API REST pour un système de gestion de contenus éditoriaux.

- Gestion des **articles** (CRUD + changement de statut + filtres avancés)
- Gestion des **catégories** (CRUD + compteur d’articles)
- Gestion des **réseaux** (liste)
- **Segmentation par réseau** selon l’utilisateur courant
- **Permissions** (admin vs editor) simulées via l’en-tête HTTP `x-user-id`
- **Import JSON** d’articles (simulation d’intégration CMS)
- **Notifications email** (génération HTML + historique, sans SMTP)
- Base de données **SQLite** seedée au démarrage

## Prérequis

- Node.js : **>= 18.x** (recommandé 18/20)
- npm : **>= 9.x**

## Installation

```bash
# Dans le dossier back
cd taramback
npm install
```

## Lancement

```bash
cd taramback
npm run dev
```

Serveur par défaut :
- `http://localhost:3002`
- API : `http://localhost:3002/api`

Changer le port (ex : 3002 → 3001) :

```bash
PORT=3001 npm run dev
```

### Servir le Front (build React) depuis le Back

Le back peut servir l’UI React compilée.

1) Compiler le front :

```bash
cd taramfront
npm run build
```

2) Copier le build dans le back :

```bash
cp -r taramfront/build taramback/public
```

3) Démarrer le back :

```bash
cd taramback
PORT=3002 npm run dev
```

Ensuite :
- UI : `http://localhost:3002/`
- API : `http://localhost:3002/api`

### Configuration SMTP (Gmail)

Pour activer l’envoi réel d’emails, configurer un fichier `.env` dans `taramback/`.

Variables attendues :

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=ton.adresse@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
SMTP_FROM="Taram CMS <ton.adresse@gmail.com>"
```

Remarque : Gmail requiert généralement un **mot de passe d’application** (compte avec 2FA). Le mot de passe normal du compte ne fonctionne pas.

## Choix techniques

- **Express** : API REST simple et lisible
- **TypeScript** : typage + maintenabilité
- **SQLite** : base embarquée adaptée à la démo (seed rapide)
- **Architecture** : séparation `routes/` → `controllers/` → `services/` → `utils/`
  - `routes/` : endpoints
  - `controllers/` : permissions + validation + orchestration
  - `services/` : logique métier + requêtes DB
  - `middleware/` : gestion centralisée des erreurs

### Segmentation / permissions

- L’utilisateur courant est chargé via l’en-tête **`x-user-id`**.
- **Admin** : accès complet.
- **Editor** : accès restreint à son `networkId`.

## Fonctionnalités implémentées

- CRUD Articles : **complet**
- Filtres avancés : **complet**
- Dashboard (stats agrégées) : **complet**
- Gestion catégories et réseaux : **complet**
- Module notifications (historique + génération HTML) : **complet**
- Import JSON : **complet**
- Permissions + segmentation réseau : **complet**
- Tests : **non fait** (pas de suite back dédiée)

## Ce qui aurait été fait avec plus de temps

- Tests automatisés back (services/controllers)
- Envoi SMTP réel (provider + `.env`)
- Gestion utilisateurs plus complète (CRUD + UI + audit)
- Validation encore plus stricte et messages d’erreur uniformisés

## Tests

Pas de suite de tests back dédiée.

Validation rapide :

```bash
cd taramback
npm run build
```

## Difficultés rencontrées

- **Segmentation réseau** : filtrer les ressources selon `networkId` et le rôle
- **Import JSON** : mapper `category` et `network` par nom + retour d’erreurs détaillé
- **Notifications** : génération HTML réutilisable + historique fiable sans dépendance SMTP
