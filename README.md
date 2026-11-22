# Portfolio 3D — Salle serveur

Site statique (HTML/CSS/JS) : un couloir de baies serveurs en Three.js, parcouru au scroll.
Contenu complet dans le DOM (accessible au clavier), repli 2D si WebGL est indisponible ou si `prefers-reduced-motion` est actif.

## Lancer en local
Les modules JS sont bloqués en `file://`, il faut un petit serveur :

    python3 -m http.server 8000     # puis ouvrir http://localhost:8000

## Reconstruire `main.js`
`main.js` est la version minifiée de `src/main.js` (Three.js inclus, aucun CDN).

    npm i three esbuild
    npx esbuild src/main.js --bundle --minify --format=iife --target=es2020 --outfile=main.js

## Structure
- `index.html`, `styles.css`, `main.js` (généré), `src/main.js` (source)
- `assets/` : polices auto-hébergées (Chakra Petch, Fira Code), photo, CV

## À vérifier avant mise en ligne
- Dates de la Licence (2024 — présent) et lien du dépôt « Ce portfolio ».
- Rendu sur un vrai GPU et un vrai téléphone.
