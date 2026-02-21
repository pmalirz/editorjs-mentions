import { EditorJSMentions } from "../src/editorjs-mentions";
import { MentionsDropdown } from "../src/dropdown";
import { MentionsTooltip } from "../src/tooltip";

// Mock dependencies
jest.mock("../src/dropdown");
jest.mock("../src/tooltip");
jest.mock("../src/styles");

describe("EditorJSMentions", () => {
  let holder: HTMLElement;
  let mentions: EditorJSMentions;

  beforeEach(() => {
    document.body.innerHTML = '<div id="editor"></div>';
    holder = document.getElementById("editor") as HTMLElement;
    (MentionsDropdown as jest.Mock).mockClear();
    (MentionsTooltip as jest.Mock).mockClear();
  });

  afterEach(() => {
    if (mentions) {
      mentions.destroy();
    }
  });

  it("should initialize correctly with valid config", () => {
    mentions = new EditorJSMentions({
      holder: "editor",
      provider: async () => [],
    });

    expect(MentionsDropdown).toHaveBeenCalledTimes(1);
    expect(MentionsTooltip).toHaveBeenCalledTimes(1);
  });

  it("should throw error if holder not found", () => {
    expect(() => {
      new EditorJSMentions({
        holder: "non-existent",
        provider: async () => [],
      });
    }).toThrow("Cannot find holder element by id: non-existent");
  });

  it("should accept holder as HTMLElement", () => {
    mentions = new EditorJSMentions({
      holder: holder,
      provider: async () => [],
    });
    expect(MentionsDropdown).toHaveBeenCalledTimes(1);
  });

  it("should destroy correctly", () => {
    mentions = new EditorJSMentions({
      holder: "editor",
      provider: async () => [],
    });

    const dropdownInstance = (MentionsDropdown as jest.Mock).mock.instances[0];
    const tooltipInstance = (MentionsTooltip as jest.Mock).mock.instances[0];

    mentions.destroy();

    expect(dropdownInstance.destroy).toHaveBeenCalledTimes(1);
    expect(tooltipInstance.destroy).toHaveBeenCalledTimes(1);
  });
});
