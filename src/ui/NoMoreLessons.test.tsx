import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { NoMoreLessons } from "./NoMoreLessons";

describe("<NoMoreLessons> (issue #8 — clear message, not a blank screen)", () => {
  const html = renderToStaticMarkup(
    <NoMoreLessons
      interfaceLanguage="en"
      onBrowseThemes={() => {}}
      onViewJourney={() => {}}
    />,
  );

  it("explains that every lesson has been completed", () => {
    expect(html).toMatch(/completed|no more|every lesson|caught up/i);
  });

  it("offers a way forward (browse themes and view journey)", () => {
    expect(html).toMatch(/theme|another|browse/i);
    expect(html).toMatch(/journey/i);
    // two actionable buttons
    expect((html.match(/<button/g) ?? []).length).toBeGreaterThanOrEqual(2);
  });
});
