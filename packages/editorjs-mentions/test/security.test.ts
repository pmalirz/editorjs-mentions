import { MentionsDropdown } from "../src/dropdown";

describe("Security", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    container.id = "editor";
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  test("MentionsDropdown escapes displayName in SVG placeholder", () => {
    const dropdown = new MentionsDropdown({
      onSelect: () => {},
    });

    const maliciousItem = {
      id: "1",
      displayName: '<script>alert(1)</script>',
    };

    dropdown.show({ left: 0, top: 0 }, [maliciousItem]);

    const avatar = document.body.querySelector(".editorjs-mentions-item-avatar") as HTMLImageElement;
    expect(avatar).not.toBeNull();

    // Decode the data URI to check the SVG content
    const svgContent = decodeURIComponent(avatar.src.split(",")[1]);

    // It should contain escaped <
    expect(svgContent).toContain("&lt;");
    expect(svgContent).not.toContain("<script");
  });
});
