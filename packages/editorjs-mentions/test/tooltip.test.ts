import { MentionsTooltip } from "../src/tooltip";
import type { MentionItem } from "../src/types";

describe("MentionsTooltip", () => {
  let tooltip: MentionsTooltip;
  const mockItem: MentionItem = {
    id: "1",
    displayName: "John Doe",
    description: "Engineer",
    link: "http://example.com",
    image: "http://example.com/image.png",
  };

  beforeEach(() => {
    document.body.innerHTML = "";
    tooltip = new MentionsTooltip();
  });

  afterEach(() => {
    tooltip.destroy();
  });

  it("should create a tooltip element in the body", () => {
    const tooltipEl = document.querySelector(".editorjs-mention-tooltip") as HTMLElement;
    expect(tooltipEl).not.toBeNull();
    expect(tooltipEl.style.display).toBe("none");
  });

  it("should show the tooltip with correct content and position", () => {
    const anchor = document.createElement("a");
    document.body.appendChild(anchor);
    // Mock getBoundingClientRect
    jest.spyOn(anchor, "getBoundingClientRect").mockReturnValue({
      left: 100,
      bottom: 200,
      top: 180,
      right: 150,
      width: 50,
      height: 20,
      x: 100,
      y: 180,
      toJSON: () => {},
    });

    tooltip.show(anchor, mockItem);

    const tooltipEl = document.querySelector(".editorjs-mention-tooltip") as HTMLElement;
    expect(tooltipEl.style.display).toBe("block");
    expect(tooltipEl.style.left).toBe("100px");
    expect(tooltipEl.style.top).toBe("206px"); // 200 + 6

    expect(tooltipEl.innerHTML).toContain("John Doe");
    expect(tooltipEl.innerHTML).toContain("Engineer");
    expect(tooltipEl.innerHTML).toContain('href="http://example.com"');
    expect(tooltipEl.innerHTML).toContain('src="http://example.com/image.png"');
  });

  it("should hide the tooltip", () => {
    const anchor = document.createElement("a");
    jest.spyOn(anchor, "getBoundingClientRect").mockReturnValue({
      left: 0, bottom: 0, top: 0, right: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => {}
    });
    tooltip.show(anchor, mockItem);
    expect(tooltip.isVisible()).toBe(true);

    tooltip.hide();
    const tooltipEl = document.querySelector(".editorjs-mention-tooltip") as HTMLElement;
    expect(tooltipEl.style.display).toBe("none");
    expect(tooltipEl.innerHTML).toBe("");
    expect(tooltip.isVisible()).toBe(false);
  });

  it("should check if it contains a node", () => {
    const anchor = document.createElement("a");
    jest.spyOn(anchor, "getBoundingClientRect").mockReturnValue({
      left: 0, bottom: 0, top: 0, right: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => {}
    });
    tooltip.show(anchor, mockItem);

    const tooltipEl = document.querySelector(".editorjs-mention-tooltip") as HTMLElement;
    const inner = tooltipEl.querySelector(".editorjs-mention-tooltip-inner");

    expect(tooltip.contains(inner)).toBe(true);
    expect(tooltip.contains(document.body)).toBe(false);
  });
});
