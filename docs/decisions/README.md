# Décisions

Deux niveaux de traçabilité des décisions :

- **Journal de décisions** (ci-dessous) — décisions **produit / process** légères,
  utiles à retracer mais qui ne justifient pas une ADR.
- **ADR** ([`adr/`](adr/README.md)) — *Architecture Decision Records*, réservés aux
  choix **structurants** (techniques ou d'architecture).

## Journal de décisions

| # | Date | Décision | Contexte / raison |
|---|------|----------|-------------------|
| D-01 | 2026-08-21 | *(superseded par D-05)* Repository en Product Discovery ; aucun développement sans GO du PO. | Cadrage initial de gouvernance. |
| D-02 | 2026-08-21 | Séparer conceptuellement et physiquement `declaredLevel` et `estimatedLevel` (`estimatedLevel = null` au départ). | Invariant du modèle pédagogique (personnalisation). |
| D-03 | 2026-08-21 | Socle applicatif : Vite + React + TypeScript + Vitest, sans backend ni IA pour US-01. | Le plus léger et maintenable pour une tranche frontend testable. Voir [ADR-0001](adr/0001-frontend-foundation-and-local-persistence.md). |
| D-04 | 2026-08-21 | **Confirmée par le PO.** Valider un parcours exige un niveau déclaré **et** au moins un centre d'intérêt ; « Surprise me » est un choix valide. | LONTANO part de ce que l'utilisateur a réellement envie de lire : les intérêts participent directement à la promesse produit, ce ne sont pas une info de profil secondaire. « Surprise me » permet de poursuivre sans choisir un genre précis. |
| D-05 | 2026-08-21 | GO MVP donné par le PO : le développement est lancé, focalisé sur la 1ʳᵉ tranche de US-01. Supersede D-01. | Passage de Product Discovery à MVP Delivery. |
| D-06 | 2026-08-21 | **LONTANO is multimodal, not reading-only.** La lecture est une modalité (la première du MVP), pas la définition du produit. Boucle pédagogique générique : `DISCOVER → UNDERSTAND → RECALL → USE → MEMORY → JOURNEY`. Aucune nouvelle modalité développée pour l'instant. | La variété doit augmenter l'envie de revenir dans l'app ; la transmission ne dépend pas d'un seul média ; la lecture reste une modalité forte mais ne doit pas contraindre le futur produit ; le modèle pédagogique doit pouvoir supporter plusieurs types d'expériences. *(Décision produit/pédagogique — pas d'ADR : aucun choix d'architecture technique.)* |
