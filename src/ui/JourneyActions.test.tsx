import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { JourneyActions } from "./JourneyActions";

const noop = () => {};

describe("<JourneyActions> (issue #18 / #20 — always an action)", () => {
  it("renders a button for each action, at least one", () => {
    const html = renderToStaticMarkup(
      <JourneyActions
        actions={["continue", "start", "redo"]}
        hasContent={true}
        level="A1"
        interfaceLanguage="en"
        onStart={noop}
        onContinue={noop}
        onRedo={noop}
      />,
    );
    expect((html.match(/<button/g) ?? []).length).toBe(3);
  });

  it("empty state (no content) shows the coming-soon note AND still an action", () => {
    const html = renderToStaticMarkup(
      <JourneyActions
        actions={["start"]}
        hasContent={false}
        level="B2"
        interfaceLanguage="en"
        onStart={noop}
        onContinue={noop}
        onRedo={noop}
      />,
    );
    expect(html).toMatch(/B2/); // "content coming for level B2"
    expect((html.match(/<button/g) ?? []).length).toBeGreaterThanOrEqual(1);
  });
});
