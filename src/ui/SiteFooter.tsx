/*
 * COMPOSTEL — global footer (issue #3).
 *
 * Rendered under every page via the app root. Carries the brand logo, the
 * RGPD links (legal notice, privacy policy, cookies/consent), a support entry
 * point and the contact address. Structure mirrors the Hazumi footer, adapted
 * to the compostel.fr domain.
 */

import { BrandLogo } from "./BrandLogo";
import { SUPPORT_EMAIL } from "../domain/support";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="sitefooter" aria-label="Pied de page">
      <BrandLogo size="sm" />

      <p className="sitefooter__brandline">
        Compostel · A new language. A wider world. ·{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </p>

      <nav className="sitefooter__links" aria-label="Informations légales">
        <a href="#/mentions-legales">Mentions légales</a>
        <span aria-hidden="true">·</span>
        <a href="#/confidentialite">Politique de confidentialité</a>
        <span aria-hidden="true">·</span>
        <a href="#/cookies">Cookies &amp; consentement</a>
        <span aria-hidden="true">·</span>
        <a href="#/support">Support</a>
      </nav>

      <p className="sitefooter__legal">
        Conformément au RGPD, vos données personnelles (email, progression
        d'apprentissage) sont traitées uniquement pour fournir le service et ne
        sont jamais cédées à des tiers. © {year} Compostel.
      </p>
    </footer>
  );
}
