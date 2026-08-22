# US-UX-01 — Establish the COMPOSTELLE experience

- **ID** : US-UX-01
- **Statut** : Implemented — awaiting PO validation
- **Type** : Transversale (référentiel UX du MVP)

## User story

> As a learner,
> I want COMPOSTELLE to feel simple, immersive and coherent,
> so that learning feels like a journey rather than using a learning tool.

Cette US est le **référentiel UX transversal** du MVP : toutes les autres US (login,
US-01, US-02, futures) doivent s'y conformer.

## Signature produit

> **A new language. A wider world.** (marque : COMPOSTELLE — D-15)

## Principes (ce que COMPOSTELLE n'est PAS / EST)

COMPOSTELLE ne doit **pas** ressembler à : back-office, série de formulaires, grille
Netflix, dashboard SaaS, app scolaire, démo technique.

COMPOSTELLE **doit** être : calme, éditorial, premium sans ostentation, lisible,
simple, immersif, mobile-first, cohérent. Priorité visuelle :
`language → journey → content → progression`. Éviter la surabondance de cards,
badges, encadrés, icônes, menus, boutons concurrents.

## Acceptance criteria

- [x] **Une seule voix visuelle** : mêmes tokens (couleurs, typo, espacements) sur
  login, onboarding, discover, content ; aucune duplication d'écran entre langues.
- [x] **Login = vraie entrée COMPOSTELLE** : marque + tagline + email + password +
  Sign in ; loading, erreur claire (aria-live), autofocus email, labels accessibles,
  navigation clavier, responsive.
- [x] **Home/Journey lisible d'un coup d'œil** : langue active identifiable, niveau
  déclaré visible comme **contexte discret** (« Italian · B2 »), pas un KPI ; le
  niveau ne disparaît jamais de l'expérience.
- [x] **Language switch trivial** : Italian ↔ Spanish en un geste ; change le journey,
  le niveau, les intérêts, le contenu ; ne détruit aucune donnée ; aucun mélange de
  catalogues.
- [x] **Journey → Discover → Content continu** : feed éditorial (1 proposition
  principale + quelques alternatives), métadonnées utiles seulement (titre, thème,
  teaser, durée, langue active) ; lecture agréable (mesure de ligne correcte,
  hiérarchie typo, espacement, retour évident, pas de chrome inutile).
- [x] **Content isolé par langue** : Italian journey → Italian content only ; Spanish
  journey → Spanish content only (moteur de sélection unique, filtre par langue).
- [x] **Responsive** : mobile ~375 px, tablette, desktop — CTA touchables, aucun
  overflow horizontal, formulaire login et switch utilisables au doigt.
- [x] **Accessibilité MVP** : HTML sémantique, labels, focus visible, vrais boutons,
  clavier, contraste raisonnable, `aria-live` sur les états pertinents, aucune
  information critique portée uniquement par la couleur/hover.

## Implementation notes

- Login : [`src/ui/AuthScreen.tsx`](../../src/ui/AuthScreen.tsx) (marque + tagline,
  autofocus, `aria-live` sur l'erreur, labels).
- Home / switch : [`src/ui/Discover.tsx`](../../src/ui/Discover.tsx) (barre de langues
  « Label · Niveau », langue active `aria-current`), niveau via
  [`levelBadge`](../../src/domain/journey.ts).
- Feed / content : [`DiscoveryFeed.tsx`](../../src/ui/DiscoveryFeed.tsx),
  [`ContentView.tsx`](../../src/ui/ContentView.tsx).
- Design tokens et responsive : [`src/styles.css`](../../src/styles.css).

## Hors périmètre (non développé ici)

UNDERSTAND / RECALL / USE / MEMORY, social login, MFA, profil, rôles, admin, reset
password (backlog). Pas de dashboard, pas de sous-système de gestion de langue.

## Statut & historique

- **Implemented** — principes UX établis et appliqués (login, home/journey, switch,
  discover, content, mobile, a11y MVP). **Awaiting PO validation.**
