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
| R1 | Écran d'accueil premium | Ouvrir l'app (aucun parcours existant) | Un seul écran, sobre : titre **COMPOSTELLE** (onglet), « Learn a language through things worth discovering », « Discovering in **Italian** », choix du niveau, intérêts, bouton « Start discovering ». Aucune impression de formulaire. Aucun « LONTANO » visible. |
| R2 | Impossible de valider sans niveau | Ne rien sélectionner ; observer le bouton | « Start discovering » **désactivé**. |
| R3 | Niveau seul insuffisant | Choisir un niveau, aucun intérêt | « Start discovering » toujours **désactivé**. |
| R4 | Validation nominale | Choisir un niveau + au moins un intérêt, cliquer « Start discovering » | Arrivée directe sur l'écran **DISCOVER** (US-02) — voir [recette-US-02](recette-US-02.md). L'écran résumé US-01 n'est plus la destination. |
| R5 | « I don't know my level » | Choisir « I don't know my level » + un intérêt, valider | Parcours créé (`declaredLevel = UNKNOWN`) ; arrivée sur Discover. |
| R6 | Sélection multiple d'intérêts | Cliquer plusieurs intérêts, puis en désélectionner un | Les intérêts se cochent/décochent ; le feed Discover reflète les intérêts retenus. |
| R7 | « Surprise me » | Choisir un niveau + « Surprise me » uniquement, valider | Validation possible (un seul intérêt suffit). |
| R8 | **Persistance après rechargement** | Après R4, recharger la page (F5) | Le parcours est **conservé** : Discover réapparaît directement (pas de ré-onboarding). |
| R9 | Nouveau parcours | Sur Discover, cliquer « Start a new journey » | Retour à l'onboarding vierge ; après rechargement, l'onboarding reste vierge. |
| R10 | Séparation des niveaux | (Vérifié par tests) inspecter le `localStorage` (`compostelle.journey.v1`) | L'objet contient `declaredLevel` renseigné **et** `estimatedLevel: null`, champs distincts. |
| R11 | **Migration legacy** | Placer un parcours valide sous l'ancienne clé `lontano.journey.v1` (et rien sous la nouvelle), recharger | Le parcours est **récupéré**, ré-écrit sous `compostelle.journey.v1`, et `lontano.journey.v1` est **supprimé**. Aucun parcours perdu. |

## Résultat de la dernière passe

- Tests automatisés : **verts** (dont migration legacy).
- Scénarios R1–R11 : R10/R11 couverts par tests automatisés ; R1–R9 contrôlés lors de
  l'implémentation ; console sans erreur.
