import { levelBadge, type LanguageJourney } from "../domain/journey";
import { languageLabel } from "../domain/language";
import {
  t,
  INTERFACE_LANGUAGES,
  type InterfaceLanguage,
} from "../domain/i18n";

interface MySpaceProps {
  journeys: LanguageJourney[];
  interfaceLanguage: InterfaceLanguage;
  userEmail: string | null;
  onSetInterfaceLanguage: (language: InterfaceLanguage) => void;
  onAddLanguage: () => void;
  onSignOut?: () => void;
}

/**
 * MY SPACE — the personal area: profile, preferences (interface language,
 * languages learned), account. Distinct from MY JOURNEY (learning) and HOME.
 */
export function MySpace({
  journeys,
  interfaceLanguage,
  userEmail,
  onSetInterfaceLanguage,
  onAddLanguage,
  onSignOut,
}: MySpaceProps) {
  const il = interfaceLanguage;

  return (
    <section className="space" aria-labelledby="space-title">
      <header className="onboarding__intro">
        <p className="onboarding__eyebrow">{t("me.eyebrow", il)}</p>
      </header>

      <div className="dash__block">
        <h2 className="recent__label">{t("me.profile", il)}</h2>
        <dl className="rows">
          <div className="row">
            <dt>{t("me.email", il)}</dt>
            <dd>{userEmail ?? t("me.local_account", il)}</dd>
          </div>
        </dl>
      </div>

      <div className="dash__block">
        <h2 className="recent__label">{t("me.explain_in", il)}</h2>
        <div className="chips" role="radiogroup" aria-label="Interface language">
          {INTERFACE_LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              role="radio"
              aria-checked={interfaceLanguage === l.code}
              disabled={!l.ready}
              className={
                "chip" +
                (interfaceLanguage === l.code ? " chip--on" : "") +
                (l.ready ? "" : " chip--soon")
              }
              onClick={() => l.ready && onSetInterfaceLanguage(l.code)}
            >
              {l.label}
              {!l.ready && " · soon"}
            </button>
          ))}
        </div>
      </div>

      <div className="dash__block">
        <h2 className="recent__label">{t("me.learning", il)}</h2>
        <ul className="recent__list">
          {journeys.map((j) => {
            const badge = levelBadge(j.declaredLevel);
            return (
              <li key={j.language} className="recent__item">
                <span className="recent__expr">{languageLabel(j.language)}</span>
                {badge && <span className="tag">{badge}</span>}
              </li>
            );
          })}
        </ul>
        <button type="button" className="link" onClick={onAddLanguage}>
          {t("me.add_language", il)}
        </button>
      </div>

      <div className="dash__block">
        <h2 className="recent__label">{t("me.account", il)}</h2>
        <p className="dash__soon">{t("me.reset_password", il)}</p>
        {onSignOut && (
          <button type="button" className="cta cta--ghost" onClick={onSignOut}>
            {t("home.signout", il)}
          </button>
        )}
      </div>
    </section>
  );
}
