# Architecture Decision Records (ADR)

Les ADR tracent les **décisions d'architecture structurantes**. Aucune n'est
nécessaire tant que le projet reste en Product Discovery (pas de choix technique
arrêté).

Convention de nommage : `NNNN-titre-court.md` (p. ex. `0001-choix-du-stockage.md`).

## Index

- [ADR-0001](0001-frontend-foundation-and-local-persistence.md) — Socle frontend et
  persistance locale pour la 1ʳᵉ tranche *(Accepted)*.
- [ADR-0002](0002-durable-persistence-supabase.md) — Persistance durable avec
  Supabase / PostgreSQL *(Accepted)*.
- [ADR-0003](0003-language-agnostic-domain.md) — Modèle de domaine
  langue-agnostique (it + es) *(Accepted)*.
- [ADR-0004](0004-auth-magic-link.md) — Authentification email magic-link
  (propriété `auth.uid()`) *(Accepted)*.

## Gabarit

```markdown
# ADR-NNNN — <Titre>

- **Statut** : Proposed | Accepted | Superseded by ADR-XXXX
- **Date** : AAAA-MM-JJ

## Contexte
Le problème et les forces en présence.

## Décision
Le choix retenu.

## Conséquences
Positives, négatives, et suites éventuelles.

## Alternatives envisagées
Options écartées et pourquoi.
```
