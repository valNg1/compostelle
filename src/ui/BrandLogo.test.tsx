import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { BrandLogo } from "./BrandLogo";

describe("<BrandLogo> (issue #2 — logo on every page)", () => {
  const html = renderToStaticMarkup(<BrandLogo />);

  it("renders the scallop logo image with descriptive alt text", () => {
    expect(html).toContain("<img");
    expect(html).toMatch(/alt="Compostel[^"]*"/);
    // points at a real asset shipped in public/
    expect(html).toMatch(/src="\/icon-192\.png"/);
  });

  it("links back to the home section", () => {
    expect(html).toContain('href="#/home"');
  });

  it("shows the Compostel wordmark", () => {
    expect(html).toContain("COMPOSTEL");
  });
});
