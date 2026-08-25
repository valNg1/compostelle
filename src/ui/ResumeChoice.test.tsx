import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ResumeChoice } from "./ResumeChoice";

describe("<ResumeChoice> (issue #7 — two explicit buttons)", () => {
  it("offers both 'redo' and 'continue' when a next lesson exists", () => {
    const html = renderToStaticMarkup(
      <ResumeChoice
        unitTitle="Pompei"
        hasNext={true}
        interfaceLanguage="en"
        onReplay={() => {}}
        onContinue={() => {}}
      />,
    );
    expect(html).toContain("Redo");
    expect(html).toContain("Continue");
    expect(html).toContain("Pompei");
    // continue button is enabled (no disabled attribute on it)
    expect(html).not.toContain("disabled");
  });

  it("disables 'continue' and explains when every lesson is done", () => {
    const html = renderToStaticMarkup(
      <ResumeChoice
        unitTitle="Pompei"
        hasNext={false}
        interfaceLanguage="en"
        onReplay={() => {}}
        onContinue={() => {}}
      />,
    );
    expect(html).toContain("Redo"); // redo still available
    expect(html).toContain("disabled"); // continue disabled
    expect(html).toMatch(/finished|every lesson|done/i); // all-done note
  });
});
