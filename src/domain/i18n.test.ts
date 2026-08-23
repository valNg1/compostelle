import { describe, it, expect } from "vitest";
import {
  t,
  isInterfaceLanguage,
  INTERFACE_LANGUAGES,
} from "./i18n";

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
