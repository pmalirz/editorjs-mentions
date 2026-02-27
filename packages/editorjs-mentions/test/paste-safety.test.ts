import { EditorJSMentions } from "../src/editorjs-mentions";
import { MentionsDropdown } from "../src/dropdown";
import { MentionsTooltip } from "../src/tooltip";

// Mock dependencies
jest.mock("../src/dropdown");
jest.mock("../src/tooltip");
jest.mock("../src/styles");

describe("Paste Safety", () => {
  let holder: HTMLElement;
  let mentions: EditorJSMentions;

  beforeEach(() => {
    document.body.innerHTML = '<div id="editor" contenteditable="true"></div>';
    holder = document.getElementById("editor") as HTMLElement;

    // Reset mocks
    (MentionsDropdown as jest.Mock).mockClear();
    (MentionsTooltip as jest.Mock).mockClear();
  });

  afterEach(() => {
    if (mentions) {
      mentions.destroy();
    }
    document.body.innerHTML = "";
    jest.restoreAllMocks();
  });

  it("should remove scripts from pasted HTML", () => {
    mentions = new EditorJSMentions({
      holder: holder,
      provider: async () => [],
    });

    const maliciousHtml = '<div><script>alert("xss")</script><a class="editorjs-mention" data-mention-id="1">@User</a></div>';

    // Mock Selection
    const range = document.createRange();
    range.setStart(holder, 0);
    range.setEnd(holder, 0);

    const selection = {
      getRangeAt: jest.fn(() => range),
      rangeCount: 1,
      removeAllRanges: jest.fn(),
      addRange: jest.fn(),
      deleteFromDocument: jest.fn(),
    };

    // We need to overwrite getSelection on window
    const originalGetSelection = window.getSelection;
    window.getSelection = jest.fn(() => selection as unknown as Selection);

    // Mock createContextualFragment
    range.createContextualFragment = jest.fn((html) => {
        const div = document.createElement('div');
        div.innerHTML = html;
        const frag = document.createDocumentFragment();
        while (div.firstChild) {
            frag.appendChild(div.firstChild);
        }
        return frag;
    });

    range.deleteContents = jest.fn();
    range.insertNode = jest.fn();

    // Mock ClipboardEvent
    const event = new Event('paste', { bubbles: true, cancelable: true }) as ClipboardEvent;
    const clipboardData = {
        getData: jest.fn((type) => {
            if (type === 'text/html') return maliciousHtml;
            if (type === 'application/x-editorjs-mentions') return maliciousHtml;
            return '';
        }),
        setData: jest.fn(),
    };
    Object.defineProperty(event, 'clipboardData', {
      value: clipboardData
    });

    holder.dispatchEvent(event);

    // Verify createContextualFragment called with sanitized HTML
    expect(range.createContextualFragment).toHaveBeenCalled();
    const calledHtml = (range.createContextualFragment as jest.Mock).mock.calls[0][0];

    // It should strip script tags
    expect(calledHtml).not.toContain('<script>');
    // It should keep the mention anchor
    expect(calledHtml).toContain('editorjs-mention');

    // Restore
    window.getSelection = originalGetSelection;
  });
});
