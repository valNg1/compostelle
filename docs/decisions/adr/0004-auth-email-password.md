# ADR-0004 — Authentication via Supabase email + password

- **Statut** : Accepted (révisé 2026-08-22 : email+password, remplace le magic-link initial)
- **Date** : 2026-08-22

## Contexte

Un UUID en `localStorage` n'est pas une identité durable : effacer le navigateur perd
le lien vers les données serveur. Le MVP a besoin d'une identité stable pour retrouver
les parcours d'un apprenant depuis n'importe quelle session. Le PO veut une connexion
**email + mot de passe** (comme Hazumi), sans complexité inutile.

## Décision

**Supabase Auth en email + password.** La clé de propriété durable reste
**`auth.uid()`** — pas d'identité maison, RLS inchangée.

- **Port** : [`authService.ts`](../../../src/application/authService.ts)
  (`getUser`, `signInWithPassword`, `signOut`, `onAuthChange`).
- **Adaptateur** : [`supabaseAuth.ts`](../../../src/persistence/supabaseAuth.ts)
  (`auth.signInWithPassword`, `onAuthStateChange`, `getUser`, `signOut`).
- **Logique de connexion** : [`signIn.ts`](../../../src/application/signIn.ts)
  (`attemptSignIn` — valide les entrées, ne lève jamais, message clair si échec).
- **UI** : [`AuthScreen.tsx`](../../../src/ui/AuthScreen.tsx) — email, mot de passe,
  bouton Sign in, état de chargement, message d'erreur clair.
- **Gate** : en mode durable (Supabase configuré), l'app exige la connexion ; en
  cache-only (pas de config), l'app tourne en anonyme local (mono-appareil).
- Toutes les lignes `journeys` sont possédées par `auth.uid()` et protégées par la RLS
  owner-only ([ADR-0002](0002-durable-persistence-supabase.md)).

### Hors périmètre MVP (non développé)

reset password, MFA, social login, profil utilisateur, rôles, admin. Le compte de
démonstration est créé directement dans Supabase Auth par le PO — **aucun credential
n'est écrit dans le code, les tests, les fixtures ou la doc**.

## Conséquences

- **Positives** : identité durable et récupérable (reconnexion → parcours restaurés) ;
  UX familière (email/mot de passe) ; propriété des données claire ; le magic-link
  (OTP) et son écran « check your inbox » sont supprimés.
- **Négatives / limites** : la vérification runtime exige un projet Supabase live avec
  un compte créé par le PO. Pas de reset password au MVP (assumé).

## Alternatives envisagées

- **Magic-link (OTP)** : choix initial, remplacé à la demande du PO par email+password.
- OAuth social / identité maison : rejetés (superflus / non durables).
