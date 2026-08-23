import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SupportForm } from "./SupportForm";

describe("<SupportForm> (issue #4 — send a ticket to the admin)", () => {
  it("renders fields for email, subject and message plus a submit control", () => {
    const html = renderToStaticMarkup(<SupportForm userEmail="me@compostel.fr" />);
    expect(html).toContain("<form");
    // three inputs: email / subject / message
    expect(html).toMatch(/type="email"/);
    expect(html).toContain("<textarea");
    expect(html).toMatch(/type="submit"|<button/);
  });

  it("prefills the user email when known", () => {
    const html = renderToStaticMarkup(<SupportForm userEmail="me@compostel.fr" />);
    expect(html).toContain("me@compostel.fr");
  });

  it("always offers a mailto fallback to the support address", () => {
    const html = renderToStaticMarkup(<SupportForm userEmail={null} />);
    expect(html).toContain("mailto:contact@compostel.fr");
  });
});
