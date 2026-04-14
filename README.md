# PerfectPost Discord Bot

Bot Discord avec:
- `/status` pour afficher un embed + menu deroulant de categories/produits
- `/update` pour modifier le status d'un produit (`Updated`, `Updating`, `Down`)
- restriction des commandes via un role (`ALLOWED_ROLE_ID`)

## Installation

1. Installer les dependances:
```bash
npm install
```

2. Copier `.env.example` vers `.env` et remplir les valeurs:
- `BOT_TOKEN`
- `CLIENT_ID`
- `GUILD_ID` (recommande pour avoir les commandes instantanement)
- `ALLOWED_ROLE_ID`

3. Lancer le bot:
```bash
npm start
```

## Produits inclus

- Black Ops 7
- Product 1
- Product 2
- Arc Raiders
- Product 1
- Product 2
- Rainbox Six
- Product 1
- Product 2

Les statuses sont sauvegardes dans `data/statuses.json`.