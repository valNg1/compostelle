# User Stories

Chaque User Story validée possède **un fichier dédié** ici, nommé
`US-<ID>-<slug>.md`. Le fichier de l'US est la **source unique** de ses règles
fonctionnelles et de ses critères d'acceptation (ils ne sont dupliqués nulle part
ailleurs).

## Index

| ID | Titre | Statut |
|----|-------|--------|
| [US-01](US-01-create-language-journey.md) | Create my language journey | `Validated` |

La vue backlog complète est dans [`../product/backlog.md`](../product/backlog.md).
La légende des statuts y est également définie.

## Gabarit d'une User Story

Chaque fiche doit pouvoir documenter les champs de **traçabilité** suivants :

```markdown
# US-XX — <Titre>

- **ID** : US-XX
- **Statut** : Draft | Validated | Ready | In progress | Done
- **Étape de la boucle pédagogique** : READ | UNDERSTAND | RECALL | MEMORY | JOURNEY

## User story
As a <rôle>, I want <objectif>, so that <bénéfice>.

## Valeur utilisateur
Pourquoi cette story compte pour l'apprenant.

## Lien avec la boucle pédagogique
Comment elle s'inscrit dans READ → UNDERSTAND → RECALL → MEMORY → JOURNEY.

## Règles fonctionnelles
- ...

## Critères d'acceptation
- [ ] Given ... When ... Then ...

## Décisions éventuelles
Références vers ../decisions/ ou ../decisions/adr/ si applicable.

## Statut & historique
Journal court des changements de statut.
```
