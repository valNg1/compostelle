# Product Backlog

Backlog produit de COMPOSTELLE. Chaque User Story validée possède un fichier dédié dans
[`../user-stories/`](../user-stories/README.md) et reste la **source unique** de ses
règles et critères d'acceptation. Ce backlog n'en donne qu'une vue d'ensemble.

## Légende des statuts

| Statut | Signification |
|--------|---------------|
| `Draft` | En cours de rédaction / discussion |
| `Validated` | Validée par le Product Owner |
| `Ready` | Prête à être développée (après GO applicatif du PO) |
| `In progress` | En cours de développement |
| `Done` | Livrée et validée par le PO |
| `Implemented — awaiting MVP foundation validation` | Implémentée et testée, en attente de validation de la fondation MVP |

> **Le MVP n'est pas validé** tant que COMPOSTELLE n'a pas prouvé **des données
> apprenant durables** ET **au moins deux langues cibles** (it + es) avec la **même
> structure applicative** (voir D-12). Ces preuves sont livrées ; restent la connexion
> Supabase live et le durcissement RLS (OPEN-01/02/03).

## Stories

| ID | Titre | Étape boucle | Statut | Fiche |
|----|-------|--------------|--------|-------|
| US-01 | Create my language journey | JOURNEY (entrée) | `Done` (validée PO) | [US-01](../user-stories/US-01-create-language-journey.md) |
| US-02 | Discover something interesting | DISCOVER | `Implemented · Production deployed · Awaiting PO validation` | [US-02](../user-stories/US-02-discover-something-interesting.md) |
| US-UX-01 | Establish the COMPOSTELLE experience | Transversale | `Implemented · Awaiting PO validation` | [US-UX-01](../user-stories/US-UX-01-establish-the-compostelle-experience.md) |

## Prochaine vertical slice (proposée)

**US-03 n'est pas encore spécifiée dans Git.** Après US-02 (DISCOVER), l'étape
suivante de la boucle est **UNDERSTAND**. Proposition à valider par le PO :
**US-03 — Understand what I'm reading** (aide contextuelle légère : vocabulaire /
traduction à la demande dans la vue Content, sans casser la lecture ; pas de quiz, pas
de MEMORY). Statut : `PROPOSED / awaiting PO validation` — non démarrée (nécessite une
décision produit sur la forme de l'aide). Voir [OPEN-05](../decisions/README.md).

## Note US-02

La proposition antérieure « Choose my next reading » avait été abandonnée après le
repositionnement multimodal ([D-06](../decisions/README.md)). US-02 a été **redéfinie**
comme **« Discover something interesting »** (étape DISCOVER), cohérente avec le
modèle produit multimodal, et livrée en tranche verticale pendant une session
autonome (PO absent). **Reste à valider par le PO.**
