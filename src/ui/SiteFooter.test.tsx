import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SiteFooter } from "./SiteFooter";

describe("<SiteFooter> (issue #3 — global RGPD footer)", () => {
  const html = renderToStaticMarkup(<SiteFooter />);

  it("renders as a <footer> landmark with the brand logo", () => {
    expect(html).toContain("<footer");
    expect(html).toContain("<img");
    expect(html).toMatch(/alt="Compostel[^"]*"/);
  });

  it("exposes the RGPD links (legal, privacy, cookies/consent)", () => {
    expect(html).toContain('href="#/mentions-legales"');
    expect(html).toContain("Mentions légales");
    expect(html).toContain('href="#/confidentialite"');
    expect(html).toContain("Politique de confidentialité");
    expect(html).toContain('href="#/cookies"');
    expect(html).toMatch(/[Cc]ookies/);
  });

  it("gives a support entry point and the contact address", () => {
    expect(html).toContain('href="#/support"');
    expect(html).toContain("Support");
    expect(html).toContain("contact@compostel.fr");
  });

  it("carries a short RGPD disclaimer mentioning data protection", () => {
    expect(html).toMatch(/RGPD|données personnelles/);
  });
});
