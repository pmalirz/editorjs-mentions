export type MentionItem = {
  id: string;
  displayName: string;
  description?: string;
  image?: string;
  link?: string;
};

export type MentionQuery = {
  trigger: string;
  query: string;
  limit: number;
};

export type MentionProviderFn = (query: MentionQuery) => Promise<MentionItem[]>;

export type MentionProviderObject = {
  search: MentionProviderFn;
};

export type MentionProvider = MentionProviderFn | MentionProviderObject;

export type MentionRenderSource = "insert" | "paste" | "refresh";

export type MentionRenderArgs = {
  item: MentionItem;
  trigger: string;
  defaultText: string;
  element: HTMLAnchorElement;
  source: MentionRenderSource;
  context?: unknown;
};

export type MentionsConfig = {
  holder: string | HTMLElement;
  provider: MentionProvider;
  triggerSymbols?: string[];
  maxResults?: number;
  minChars?: number;
  debounceMs?: number;
  className?: string;
  onSelect?: (item: MentionItem) => void;
  renderItem?: (item: MentionItem) => string;
  renderMention?: (args: MentionRenderArgs) => void;
  mentionRenderContext?: unknown;
};

export type MentionEntity = {
  type: "mention";
  id: string;
  displayName: string;
  start: number;
  end: number;
  trigger?: string;
  description?: string;
  image?: string;
  link?: string;
};

export type EditorJSBlockLike = {
  id?: string;
  type: string;
  data: Record<string, unknown>;
};

export type EditorJSOutputLike = {
  time?: number;
  version?: string;
  blocks: EditorJSBlockLike[];
};
