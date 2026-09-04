import { describe, it, expect } from "vitest";
import {
  t,
  isInterfaceLanguage,
  INTERFACE_LANGUAGES,
  sublevelLabel,
  levelName,
  issueLabel,
} from "./i18n";

describe("issue-type labels follow the interaction language (issue #21 / #14)", () => {
  it("resolves known LanguageTool issue types", () => {
    expect(issueLabel("misspelling", "fr")).toBe("Orthographe");
    expect(issueLabel("grammar", "en")).toBe("Grammar");
  });
  it("falls back to the generic 'Other' label for unknown types (never a raw key)", () => {
    expect(issueLabel("some-weird-type", "fr")).toBe("Autre");
    expect(issueLabel("some-weird-type", "en")).toBe("Other");
  });
});

describe("competence labels (issue #22)", () => {
  it("resolves a sub-level to its competence label in the interaction language", () => {
    expect(sublevelLabel("A1.1", "fr")).toBe("Débutant complet");
    expect(sublevelLabel("A1.2", "fr")).toBe("Faux débutant");
    expect(sublevelLabel("A2.1", "fr")).toBe("Comprendre le quotidien");
    expect(sublevelLabel("A1.1", "en")).toBe("Absolute beginner");
  });

  it("defines labels for B1/B2 too (future content, trivial to add)", () => {
    expect(sublevelLabel("B1.1", "fr")).toBeTruthy();
    expect(sublevelLabel("B2.3", "en")).toBeTruthy();
  });

  it("returns undefined for an unknown sub-level (UI falls back cleanly)", () => {
    expect(sublevelLabel("Z9.9", "fr")).toBeUndefined();
  });

  it("names the parent level in clear language", () => {
    expect(levelName("A1", "fr")).toBe("Débutant");
    expect(levelName("A2", "en")).toBe("Elementary");
    expect(levelName("ZZ", "fr")).toBeUndefined();
  });

  it("does not change the technical identifiers", () => {
    // The label is display-only; the code A1.1 is unchanged elsewhere.
    expect(sublevelLabel("A1.1", "fr")).not.toBe("A1.1");
  });
});

describe("i18n (interface language chrome)", () => {
  it("translates a key in FR and EN", () => {
    expect(t("nav.journey", "en")).toBe("My Journey");
    expect(t("nav.journey", "fr")).toBe("Mon parcours");
  });

  it("interpolates params", () => {
    expect(t("complete.explored", "en", { n: 5 })).toBe("5 expressions explored");
    expect(t("complete.explored", "fr", { n: 5 })).toBe("5 expressions explorées");
  });

  it("falls back to English for a not-yet-translated language", () => {
    expect(t("nav.start", "ru")).toBe(t("nav.start", "en"));
  });

  it("returns the key itself for an unknown key (never throws)", () => {
    expect(t("does.not.exist", "fr")).toBe("does.not.exist");
  });

  it("marks FR + EN as ready at MVP", () => {
    const ready = INTERFACE_LANGUAGES.filter((l) => l.ready).map((l) => l.code);
    expect(ready).toContain("en");
    expect(ready).toContain("fr");
  });

  it("validates interface language codes", () => {
    expect(isInterfaceLanguage("fr")).toBe(true);
    expect(isInterfaceLanguage("xx")).toBe(false);
  });
});
