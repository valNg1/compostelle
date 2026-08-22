# Cahier de recette — US-02 « Discover something interesting »

Recette manuelle de la tranche verticale Journey → Discovery Feed → Content.

## Pré-requis

```bash
npm install
npm run dev     # ouvrir l'URL affichée
npm test        # doit être 100 % vert avant la recette manuelle
```

Pour repartir d'un état vierge : vider le `localStorage` du site, ou utiliser
« Start a new journey ».

## Flows utilisateur

### Flow A — Nouvel apprenant
| # | Étape | Résultat attendu |
|---|-------|------------------|
| A1 | Ouvrir l'app sans parcours | Onboarding US-01 affiché. |
| A2 | Choisir un niveau + l'intérêt **Thriller**, valider | Arrivée directe sur l'écran **DISCOVER**. |
| A3 | Observer la proposition principale | Un contenu mis en avant : titre, catégorie, teaser, durée estimée, modalité légère. **Aucun niveau CEFR visible.** |
| A4 | Observer les alternatives | Quelques propositions (pas de grille massive), cohérentes avec Thriller. |
| A5 | Ouvrir un contenu | Vue de découverte minimale : le contenu est consultable ; bouton retour au feed. |

### Flow B — Apprenant existant
| # | Étape | Résultat attendu |
|---|-------|------------------|
| B1 | Après A, recharger la page (F5) | Le parcours est restauré ; **DISCOVER s'affiche directement** (pas de ré-onboarding). |

### Flow C — Surprise me
| # | Étape | Résultat attendu |
|---|-------|------------------|
| C1 | Nouveau parcours avec un intérêt précis **+ Surprise me** | Le feed peut proposer un contenu d'une catégorie **hors** intérêts explicites. |

### Flow D — État local corrompu / absent
| # | Étape | Résultat attendu |
|---|-------|------------------|
| D1 | Mettre une valeur invalide dans `localStorage` (`compostelle.journey.v1` = `"{cassé"`), recharger | L'app **récupère proprement** : retour à l'onboarding, pas de page blanche. |
| D2 | Vider le `localStorage`, recharger | Onboarding affiché normalement. |

## Vérifications transverses
- Aucune erreur dans la console.
- Aucune navigation bloquante, aucune page blanche.
- États vides propres (catalogue/feed vide → message clair).
- Navigation clavier possible (Tab), focus visible, contenus ouvrables au clavier.
- Responsive : smartphone étroit, standard, tablette, desktop.

## Résultat de la dernière passe (2026-08-22)
- Tests automatisés : **44/44 verts** (dont garde-fous d'intégration catalogue).
- **Flow A** vérifié : onboarding (A2 + Thriller) → « Start discovering » → feed
  personnalisé (featured Thriller + alternative Thriller, aucun CEFR) → ouverture du
  contenu (corpus italien) → retour au feed.
- **Flow B** vérifié : rechargement → Discover directement (parcours persisté sous
  `compostelle.journey.v1`).
- **Flow C** vérifié : intérêts `sport` + `Surprise me` → feed = Sport, Sport,
  Thriller, Thriller (catégorie extérieure surfacée, déterministe).
- **Flow D** vérifié : `compostelle.journey.v1` corrompu → retour propre à
  l'onboarding, pas de page blanche.
- Responsive mobile (375px) et desktop OK ; focus clavier visible sur les cartes
  (boutons sémantiques). Aucune erreur console.
