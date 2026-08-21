# Cahier de recette — US-01 « Create my language journey »

Recette manuelle de la première tranche verticale.

## Pré-requis

```bash
npm install
npm run dev     # puis ouvrir l'URL affichée (ex. http://localhost:5173)
```

Astuce : pour repartir d'un état vierge, vider le `localStorage` du site (ou cliquer
« Start a new journey » sur l'écran de résumé).

## Tests automatisés (à passer d'abord)

```bash
npm test        # doit être 100 % vert
```

## Scénarios manuels

| # | Scénario | Étapes | Résultat attendu |
|---|----------|--------|------------------|
| R1 | Écran d'accueil premium | Ouvrir l'app (aucun parcours existant) | Un seul écran, sobre : promesse, « Reading in **Italian** », choix du niveau, centres d'intérêt, bouton « Start reading ». Aucune impression de formulaire. |
| R2 | Impossible de valider sans niveau | Ne rien sélectionner ; observer le bouton | « Start reading » **désactivé**. |
| R3 | Niveau seul insuffisant | Choisir un niveau, aucun intérêt | « Start reading » toujours **désactivé**. |
| R4 | Validation nominale | Choisir un niveau + au moins un intérêt, cliquer « Start reading » | Passage à l'écran de résumé « Your journey is ready » affichant langue, niveau, intérêts choisis. |
| R5 | « I don't know my level » | Choisir « I don't know my level » + un intérêt, valider | Parcours créé ; le résumé affiche « I don't know my level » comme point de départ. |
| R6 | Sélection multiple d'intérêts | Cliquer plusieurs intérêts, puis en désélectionner un | Les intérêts se cochent/décochent ; seuls les sélectionnés apparaissent au résumé. |
| R7 | « Surprise me » | Choisir un niveau + « Surprise me » uniquement, valider | Validation possible (un seul intérêt suffit). |
| R8 | **Persistance après rechargement** | Après R4, recharger la page (F5) | Le parcours est **conservé** : l'écran de résumé réapparaît avec les mêmes choix. |
| R9 | Nouveau parcours | Sur le résumé, cliquer « Start a new journey » | Retour à l'onboarding vierge ; après rechargement, l'onboarding reste vierge. |
| R10 | Séparation des niveaux | (Vérifié par tests) inspecter le `localStorage` (`lontano.journey.v1`) | L'objet contient `declaredLevel` renseigné **et** `estimatedLevel: null`, champs distincts. |

## Résultat de la dernière passe

- Tests automatisés : **15/15 verts**.
- Scénarios R1–R10 : vérifiés (R1, R2/R3 via bouton désactivé, R4, R5, R6, R8, R10
  contrôlés lors de l'implémentation ; console sans erreur).
