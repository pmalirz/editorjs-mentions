import { MentionsDropdown } from "../src/dropdown";
import type { MentionItem } from "../src/types";

describe("MentionsDropdown", () => {
  let dropdown: MentionsDropdown;
  let onSelectMock: jest.Mock;
  const mockItems: MentionItem[] = [
    { id: "1", displayName: "User 1" },
    { id: "2", displayName: "User 2" },
    { id: "3", displayName: "User 3" },
  ];

  beforeEach(() => {
    document.body.innerHTML = "";
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    onSelectMock = jest.fn();
    dropdown = new MentionsDropdown({
      onSelect: onSelectMock,
    });
  });

  afterEach(() => {
    dropdown.destroy();
  });

  it("should create a dropdown element in the body", () => {
    const dropdownEl = document.querySelector(".editorjs-mentions-dropdown") as HTMLElement;
    expect(dropdownEl).not.toBeNull();
    expect(dropdownEl.style.display).toBe("none");
  });

  it("should show items", () => {
    dropdown.show({ left: 100, top: 100 }, mockItems);
    const dropdownEl = document.querySelector(".editorjs-mentions-dropdown") as HTMLElement;
    expect(dropdownEl.style.display).toBe("block");
    expect(dropdownEl.children.length).toBe(3);

    expect(dropdown.isVisible()).toBe(true);
    expect(dropdown.hasItems()).toBe(true);
  });

  it("should hide items", () => {
    dropdown.show({ left: 100, top: 100 }, mockItems);
    dropdown.hide();
    const dropdownEl = document.querySelector(".editorjs-mentions-dropdown") as HTMLElement;
    expect(dropdownEl.style.display).toBe("none");
    expect(dropdown.isVisible()).toBe(false);
    expect(dropdown.hasItems()).toBe(false);
  });

  it("should navigate with moveDown and moveUp", () => {
    dropdown.show({ left: 100, top: 100 }, mockItems);
    const items = document.querySelectorAll(".editorjs-mentions-item");

    // Initial active is 0
    expect(items[0].getAttribute("data-active")).toBe("true");
    expect(items[1].getAttribute("data-active")).toBe("false");

    // Move down -> 1
    dropdown.moveDown();
    expect(items[0].getAttribute("data-active")).toBe("false");
    expect(items[1].getAttribute("data-active")).toBe("true");

    // Move down -> 2
    dropdown.moveDown();
    expect(items[2].getAttribute("data-active")).toBe("true");

    // Move down -> 0 (cycle)
    dropdown.moveDown();
    expect(items[0].getAttribute("data-active")).toBe("true");

    // Move up -> 2 (cycle)
    dropdown.moveUp();
    expect(items[2].getAttribute("data-active")).toBe("true");
  });

  it("should select item on chooseActive", () => {
    dropdown.show({ left: 100, top: 100 }, mockItems);
    dropdown.moveDown(); // Select "User 2"
    dropdown.chooseActive();
    expect(onSelectMock).toHaveBeenCalledWith(mockItems[1]);
  });

  it("should select item on click", () => {
    dropdown.show({ left: 100, top: 100 }, mockItems);
    const items = document.querySelectorAll(".editorjs-mentions-item");

    // Simulate mousedown
    const event = new MouseEvent("mousedown", { bubbles: true });
    items[2].dispatchEvent(event);

    expect(onSelectMock).toHaveBeenCalledWith(mockItems[2]);
  });

  it("should render default item structure safely with special characters", () => {
    const maliciousItem: MentionItem = {
      id: "4",
      displayName: "<script>alert('xss')</script>",
      description: "<b>bold</b>",
    };

    dropdown.show({ left: 100, top: 100 }, [maliciousItem]);
    const nameEl = document.querySelector(".editorjs-mentions-item-name");
    const descEl = document.querySelector(".editorjs-mentions-item-description");

    expect(nameEl?.textContent).toBe("<script>alert('xss')</script>");
    expect(nameEl?.innerHTML).not.toContain("<script>");

    expect(descEl?.textContent).toBe("<b>bold</b>");
    expect(descEl?.innerHTML).not.toContain("<b>");
  });
});
