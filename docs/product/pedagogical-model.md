# Modèle pédagogique

## La boucle centrale

L'expérience COMPOSTELLE repose sur une boucle unique, **générique** (indépendante d'un
média particulier) :

```
DISCOVER → UNDERSTAND → RECALL → USE → MEMORY → JOURNEY
```

### DISCOVER
Entrer en contact avec quelque chose d'intéressant dans la langue cible. La
découverte peut prendre différentes formes :

- lire ;
- écouter ;
- explorer ;
- *(plus tard)* regarder ou interagir.

> La lecture est **une** modalité de DISCOVER, pas la définition du produit.

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

### JOURNEY
Faire vivre l'apprentissage comme un **chemin continu et personnalisé**, plutôt que
comme une succession de leçons ou d'exercices isolés.

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
