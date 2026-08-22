# ADR-0004 — Authentication via Supabase email magic-link

- **Statut** : Accepted
- **Date** : 2026-08-22

## Contexte

Un UUID en `localStorage` n'est pas une identité durable : effacer le navigateur perd
le lien vers les données serveur. Le MVP a besoin d'une identité stable pour que
COMPOSTELLE retrouve les parcours d'un apprenant depuis n'importe quelle session, sans
complexité de gestion de mots de passe.

## Décision

**Supabase Auth en email magic-link (OTP passwordless).** La clé de propriété durable
est **`auth.uid()`** — pas d'identité maison.

- **Port** : [`authService.ts`](../../../src/application/authService.ts)
  (`getUser`, `signInWithEmail`, `signOut`, `onAuthChange`).
- **Adaptateur** : [`supabaseAuth.ts`](../../../src/persistence/supabaseAuth.ts)
  (`auth.signInWithOtp`, `onAuthStateChange`).
- **UI** : [`AuthScreen.tsx`](../../../src/ui/AuthScreen.tsx) — un champ email, un
  lien envoyé par mail ; aucun mot de passe.
- **Gate** : en mode durable (Supabase configuré), l'app exige la connexion ; en
  cache-only (pas de config), l'app tourne en anonyme local (mono-appareil).
- Toutes les lignes `journeys` sont possédées par `auth.uid()` et protégées par la RLS
  owner-only ([ADR-0002](0002-durable-persistence-supabase.md)).

## Conséquences

- **Positives** : identité durable et récupérable (Scénario D réel : reconnexion →
  parcours restaurés) ; pas de gestion de mots de passe ; propriété des données claire.
- **Négatives / limites** : la vérification runtime du flux magic-link exige un projet
  Supabase live + email configuré (OPEN-03 / [DEPLOYMENT.md](../../operations/DEPLOYMENT.md)).
  En cache-only, il n'y a pas d'auth (fallback dev mono-appareil assumé).

## Alternatives envisagées

- Mot de passe email/password : rejeté — complexité inutile pour le MVP.
- OAuth social : rejeté — dépendances/consentements superflus à ce stade.
- Identité maison (UUID local) : rejeté — non durable, non récupérable.
