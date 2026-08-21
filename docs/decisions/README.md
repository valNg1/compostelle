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
| D-04 | 2026-08-21 | Valider un parcours exige un niveau déclaré **et** au moins un centre d'intérêt (« Surprise me » suffit). | Donner une direction au parcours sans alourdir l'onboarding. **À confirmer par le PO.** |
| D-05 | 2026-08-21 | GO MVP donné par le PO : le développement est lancé, focalisé sur la 1ʳᵉ tranche de US-01. Supersede D-01. | Passage de Product Discovery à MVP Delivery. |
