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
| US-03 | Understand what I discover | UNDERSTAND | `PO functionally validated · adaptive density implemented` | [US-03](../user-stories/US-03-understand-what-i-discover.md) |
| US-04 | Recall what I learned | RECALL | `Implemented · Awaiting PO validation` | [US-04](../user-stories/US-04-recall-what-i-learned.md) |
| US-05 | Use the language | USE | `Implemented · Awaiting PO validation` | [US-05](../user-stories/US-05-use-the-language.md) |
| US-06 | Build my memory | MEMORY | `Implemented · Awaiting PO validation` | [US-06](../user-stories/US-06-build-my-memory.md) |
| US-07 | Continue my journey | JOURNEY | `Implemented · Awaiting PO validation` | [US-07](../user-stories/US-07-continue-my-journey.md) |
| US-UX-01 | Establish the COMPOSTELLE experience | Transversale | `Implemented · Awaiting PO validation` | [US-UX-01](../user-stories/US-UX-01-establish-the-compostelle-experience.md) |

## La boucle pédagogique est jouable

Architecture fonctionnelle **`START → LEARN → MY JOURNEY`** (D-18), LEARN =
`CONTENT → UNDERSTAND → RECALL → USE → MEMORY`. Implémentée de bout en bout, jouable en
italien et en espagnol sur la même architecture (US-02..07), autour d'une **Learning
Unit canonique de référence** (ex. *Pompei, la città sospesa*) qui sert de template au
futur pipeline IA ([contrat](../architecture/ai-learning-units.md)). MEMORY durable
(Supabase, migration `0002`). Reste à valider en Production par le PO (recette dans les
fiches US et [DEPLOYMENT.md](../operations/DEPLOYMENT.md)).

## Évolutions proposées (non démarrées)

- **Personnalisation par l'historique** : la sélection de contenu pourrait tenir
  compte de la mémoire (éviter la répétition, prioriser le *to review*). Simple,
  proposé — `PROPOSED`.
- **Enrichissement éditorial** : rendre plus de contenus jouables (annotations/recall/
  use) au-delà des 3 it + 3 es actuels — `PROPOSED`.
- **Évaluation USE plus intelligente** (si un moteur fiable est branché) — l'archi est
  prête (self-check déterministe aujourd'hui) — `PROPOSED`.

## Note US-02

La proposition antérieure « Choose my next reading » avait été abandonnée après le
repositionnement multimodal ([D-06](../decisions/README.md)). US-02 a été **redéfinie**
comme **« Discover something interesting »** (étape DISCOVER), cohérente avec le
modèle produit multimodal, et livrée en tranche verticale pendant une session
autonome (PO absent). **Reste à valider par le PO.**
