import { describe, it, expect } from "vitest";
import { SUPPORT_EMAIL, buildSupportMailto } from "./support";

describe("support mailto builder", () => {
  it("targets the Compostel support address", () => {
    expect(SUPPORT_EMAIL).toBe("contact@compostel.fr");
    const url = buildSupportMailto({
      subject: "Bug",
      message: "Ça plante",
      email: "user@example.com",
    });
    expect(url.startsWith("mailto:contact@compostel.fr?")).toBe(true);
  });

  it("encodes the subject and includes the sender email in the body", () => {
    const url = buildSupportMailto({
      subject: "Écran & clavier",
      message: "Le CTA passe sous le clavier",
      email: "val@compostel.fr",
    });
    expect(url).toContain("subject=");
    // '&' inside the subject must be percent-encoded, never a raw separator
    expect(url).toContain(encodeURIComponent("Écran & clavier"));
    expect(url).toContain(encodeURIComponent("Le CTA passe sous le clavier"));
    expect(url).toContain(encodeURIComponent("val@compostel.fr"));
    // exactly one query separator introduced by us
    expect(url.split("?").length).toBe(2);
  });

  it("falls back to a generic subject when none is given and stays valid without an email", () => {
    const url = buildSupportMailto({ subject: "", message: "Bonjour", email: "" });
    expect(url).toContain("mailto:contact@compostel.fr");
    expect(url.toLowerCase()).toContain("compostel");
    expect(url).toContain(encodeURIComponent("Bonjour"));
  });
});
