# Modèle pédagogique

## Architecture fonctionnelle officielle (D-18)

COMPOSTELLE s'organise autour de **trois espaces produit** :

```
START → LEARN → MY JOURNEY
```

- **START** — l'invitation à commencer (pas une activité pédagogique) : langue active,
  modalité (READ au MVP ; LISTEN/EXPLORE à venir), thème. « What do I feel like
  learning through today? » START **choisit une Learning Unit** correspondant au thème.
- **LEARN** — le cœur : une **activité pédagogique complète** sur une Learning Unit :

  ```
  CONTENT → UNDERSTAND → RECALL → USE → MEMORY
  ```

- **MY JOURNEY** — l'espace personnel de pilotage (ouvrable indépendamment) : langue,
  niveau, éléments mémorisés / à revoir, progression, activité récente.

### Réinterprétation de l'ancienne boucle

La boucle `DISCOVER → UNDERSTAND → RECALL → USE → MEMORY → JOURNEY` reste la colonne
vertébrale pédagogique, désormais **incarnée** par l'architecture ci-dessus :

- **DISCOVER** devient une **fonction de START** (choisir quoi apprendre aujourd'hui) ;
- **UNDERSTAND → RECALL → USE → MEMORY** sont les étapes de **LEARN** (CONTENT étant
  le point d'entrée) ;
- **JOURNEY** devient l'espace **MY JOURNEY**.

Un seul modèle, pas deux modèles contradictoires.

## Les étapes de LEARN

### CONTENT
Le point d'entrée de LEARN : la Learning Unit choisie depuis START. Le contenu est
agréable à lire mais **n'est plus une page isolée** — l'apprenant entre dans une
session d'apprentissage (READ au MVP ; LISTEN/EXPLORE plus tard).

> La lecture est **une** modalité, pas la définition du produit. Le choix du contenu
> (ex-DISCOVER) se fait dans START.

### UNDERSTAND
Recevoir l'aide nécessaire pour comprendre **sans casser l'expérience** :

- vocabulaire ;
- expressions ;
- traduction à la demande ;
- grammaire contextualisée ;
- explications adaptées au contexte.

### RECALL
Vérifier et renforcer ce qui vient d'être découvert :

- compréhension ;
- vocabulaire ;
- expressions ;
- grammaire ;
- rappel différé.

### USE
Faire **produire ou réutiliser activement** la langue. Exemples futurs possibles
(non spécifiés à ce stade) :

- reformulation ;
- réponse courte ;
- choix contextualisé ;
- mini-dialogue ;
- production guidée.

### MEMORY
Construire progressivement une **mémoire pédagogique personnelle**. Chaque élément
appris traverse des états :

```
NEW → LEARNING → ACQUIRED → TO REVIEW
```

## MY JOURNEY (ex-JOURNEY)

Faire vivre l'apprentissage comme un **chemin continu et personnalisé**, plutôt que
comme une succession de leçons isolées. Concrètement, c'est l'espace **MY JOURNEY** :
langue·niveau, ce qui est *learning* / *acquired* / *to review*, activité récente. Il
est ouvrable indépendamment de START et se met à jour après chaque session.

## Personnalisation

Le niveau **CEFR déclaré** par l'utilisateur (A1, A2, B1, B2, C1, ou « I don't know
my level ») n'est qu'une **hypothèse initiale**.

L'application devra progressivement construire son **propre modèle** de ce que
l'utilisateur :

- connaît ;
- découvre ;
- apprend ;
- maîtrise ;
- oublie ;
- doit revoir.

> **Invariant structurant** — Le niveau *déclaré* (`declaredLevel`) doit toujours
> rester conceptuellement **distinct** du futur niveau *estimé* (`estimatedLevel`)
> par COMPOSTELLE, et stocké séparément.

Conséquence : deux utilisateurs ayant déclaré le même niveau (p. ex. B1) doivent
progressivement recevoir des **expériences différentes**.

## Voir aussi

- Vision produit : [`vision.md`](vision.md)
- Décision de repositionnement : [D-06](../decisions/README.md)
- User Stories : [`../user-stories/README.md`](../user-stories/README.md)
