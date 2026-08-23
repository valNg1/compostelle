/*
 * COMPOSTEL — legal / RGPD pages (issue #3).
 *
 * Content adapted from the Hazumi implementation to the compostel.fr domain
 * and to the data Compostel actually processes (auth email, declared level,
 * learning progress, session history). Rendered as full-page overlays reached
 * from the footer via hash routes.
 */

import type { ReactNode } from "react";
import { SUPPORT_EMAIL } from "../domain/support";

const UPDATED = "août 2026";

function LegalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose?: () => void;
  children: ReactNode;
}) {
  return (
    <article className="legal" aria-labelledby="legal-title">
      {onClose && (
        <button type="button" className="link-back" onClick={onClose}>
          ← Back
        </button>
      )}
      <h1 id="legal-title" className="legal__title">
        {title}
      </h1>
      <p className="legal__meta">Dernière mise à jour : {UPDATED}</p>
      <div className="legal__body">{children}</div>
    </article>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="legal__section">
      <h2 className="legal__h2">{title}</h2>
      {children}
    </section>
  );
}

const mail = (
  <a href={`mailto:${SUPPORT_EMAIL}`} className="legal__mail">
    {SUPPORT_EMAIL}
  </a>
);

export function MentionsLegales({ onClose }: { onClose?: () => void }) {
  return (
    <LegalShell title="Mentions légales" onClose={onClose}>
      <Section title="Éditeur">
        <p>
          Le service <strong>Compostel</strong> est édité par l'éditeur du site{" "}
          <strong>compostel.fr</strong>. Les coordonnées légales complètes
          (raison sociale, SIREN, adresse du siège) sont communiquées sur simple
          demande à {mail}.
        </p>
      </Section>

      <Section title="Hébergement">
        <p>
          L'application est hébergée par <strong>Vercel Inc.</strong> (340 Pine
          Street, San Francisco, CA 94104, États-Unis). La base de données et
          l'authentification sont fournies par <strong>Supabase Inc.</strong> sur
          des serveurs situés dans l'Union Européenne.
        </p>
      </Section>

      <Section title="Données personnelles">
        <p>Dans le cadre de l'utilisation de Compostel sont traités :</p>
        <ul>
          <li>l'adresse email utilisée pour l'authentification ;</li>
          <li>la langue d'interface et les langues étudiées ;</li>
          <li>le niveau déclaré ;</li>
          <li>la progression d'apprentissage (expressions mémorisées) ;</li>
          <li>l'historique des sessions terminées.</li>
        </ul>
        <p>
          Ces données servent uniquement à fournir le service. Elles ne sont ni
          vendues ni cédées à des tiers, hors prestataires techniques
          strictement nécessaires (Supabase, Vercel).
        </p>
      </Section>

      <Section title="Cookies">
        <p>
          Compostel n'utilise que le strict nécessaire au fonctionnement de
          l'authentification (session) et un cache local dans votre navigateur.
          Aucun cookie publicitaire ni traceur tiers. Voir la page{" "}
          <a href="#/cookies">Cookies &amp; consentement</a>.
        </p>
      </Section>

      <Section title="Vos droits (RGPD)">
        <p>
          Conformément au Règlement Général sur la Protection des Données, vous
          disposez d'un droit d'accès, de rectification, d'effacement, de
          portabilité et d'opposition sur vos données. Pour les exercer,
          écrivez à {mail}. Vous pouvez saisir la CNIL (
          <a href="https://www.cnil.fr" target="_blank" rel="noreferrer">
            www.cnil.fr
          </a>
          ).
        </p>
      </Section>

      <Section title="Conservation">
        <p>
          Vos données sont conservées le temps de l'existence de votre compte,
          puis supprimées à la clôture ou sur demande.
        </p>
      </Section>

      <Section title="Contact">
        <p>Pour toute question relative à ces mentions : {mail}.</p>
      </Section>
    </LegalShell>
  );
}

export function Confidentialite({ onClose }: { onClose?: () => void }) {
  return (
    <LegalShell title="Politique de confidentialité" onClose={onClose}>
      <Section title="1. Responsable de traitement">
        <p>
          Le responsable du traitement est l'éditeur de compostel.fr, joignable à{" "}
          {mail}. La base de données est hébergée par Supabase dans l'Union
          Européenne.
        </p>
      </Section>

      <Section title="2. Données collectées">
        <ul>
          <li>
            <strong>Identifiant :</strong> adresse email (authentification) ;
          </li>
          <li>
            <strong>Préférences :</strong> langue d'interface, langues étudiées,
            niveau déclaré ;
          </li>
          <li>
            <strong>Apprentissage :</strong> progression (expressions apprises,
            en cours, à revoir), historique des sessions terminées.
          </li>
        </ul>
      </Section>

      <Section title="3. Finalités et bases légales">
        <ul>
          <li>Fournir le service d'apprentissage — exécution du service ;</li>
          <li>
            Mémoriser votre progression et personnaliser les révisions — intérêt
            légitime / exécution du service ;
          </li>
          <li>Sécuriser l'accès à votre compte — obligation de sécurité.</li>
        </ul>
      </Section>

      <Section title="4. Durée de conservation">
        <p>
          Les données sont conservées tant que le compte existe, puis supprimées
          à sa clôture ou sur demande d'effacement.
        </p>
      </Section>

      <Section title="5. Destinataires">
        <p>
          Vos données sont accessibles à vous seul (isolation par utilisateur au
          niveau de la base, RLS) et aux prestataires techniques Supabase et
          Vercel. Elles ne sont jamais revendues.
        </p>
      </Section>

      <Section title="6. Vos droits">
        <p>
          Accès, rectification, effacement, portabilité, opposition, limitation.
          Pour les exercer : {mail}. Réclamation possible auprès de la CNIL
          (cnil.fr).
        </p>
      </Section>

      <Section title="7. Sécurité">
        <p>
          Chiffrement en transit (TLS), authentification sécurisée par email +
          mot de passe, cloisonnement des données par utilisateur (RLS).
        </p>
      </Section>

      <Section title="8. Contact">
        <p>Pour toute question sur vos données personnelles : {mail}.</p>
      </Section>
    </LegalShell>
  );
}

export function Cookies({ onClose }: { onClose?: () => void }) {
  return (
    <LegalShell title="Cookies & consentement" onClose={onClose}>
      <Section title="Ce que nous utilisons">
        <p>
          Compostel n'utilise pas de cookies publicitaires ni de traceurs tiers.
          Le service repose uniquement sur :
        </p>
        <ul>
          <li>
            <strong>un cookie/jeton de session</strong> nécessaire pour vous
            garder connecté (authentification Supabase) ;
          </li>
          <li>
            <strong>un stockage local</strong> (localStorage) dans votre
            navigateur, qui met en cache votre progression pour un usage fluide
            et hors-ligne.
          </li>
        </ul>
      </Section>

      <Section title="Consentement">
        <p>
          Ces éléments étant strictement nécessaires au fonctionnement du
          service, ils ne requièrent pas de consentement préalable au sens du
          RGPD. Aucun traçage à des fins publicitaires n'est effectué, donc aucune
          bannière de consentement marketing n'est nécessaire.
        </p>
      </Section>

      <Section title="Gérer ou effacer">
        <p>
          Vous pouvez à tout moment vider le stockage local et les cookies depuis
          les réglages de votre navigateur ; vous serez alors déconnecté et le
          cache local sera reconstruit à la prochaine connexion. Pour toute
          question : {mail}.
        </p>
      </Section>
    </LegalShell>
  );
}
