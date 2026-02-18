/** Single mention candidate returned by provider and rendered in editor content. */
export type MentionItem = {
  /** Stable backend identifier used for persistence and server-side processing. */
  id: string;
  /** User-visible label rendered in autocomplete and mention chip text. */
  displayName: string;
  /** Optional secondary text displayed in dropdown and tooltip. */
  description?: string;
  /** Optional avatar/icon URL shown in dropdown and tooltip. */
  image?: string;
  /** Optional external URL shown in mention details tooltip. */
  link?: string;
};

/** Query payload passed to mention providers during autocomplete lookup. */
export type MentionQuery = {
  /** Trigger symbol that started this query, e.g. "@". */
  trigger: string;
  /** Text typed after the trigger. */
  query: string;
  /** Maximum number of results requested by the plugin. */
  limit: number;
};

/** Function-style mention provider contract. */
export type MentionProviderFn = (query: MentionQuery) => Promise<MentionItem[]>;

/** Object-style mention provider contract. */
export type MentionProviderObject = {
  search: MentionProviderFn;
};

/** Supported mention provider shapes. */
export type MentionProvider = MentionProviderFn | MentionProviderObject;

/** Origin of a mention render call. */
export type MentionRenderSource = "insert" | "paste" | "refresh";

/** Parameters passed to `renderMention` customization hook. */
export type MentionRenderArgs = {
  /** Mention metadata associated with the rendered element. */
  item: MentionItem;
  /** Trigger symbol used for this mention. */
  trigger: string;
  /** Default display text, typically `${trigger}${displayName}`. */
  defaultText: string;
  /** Mention anchor element that can be styled/customized by integrator. */
  element: HTMLAnchorElement;
  /** Render reason, useful for conditional logic. */
  source: MentionRenderSource;
  /** Arbitrary app context provided through plugin config/update API. */
  context?: unknown;
};

/** Main plugin configuration. */
export type MentionsConfig = {
  /** Editor.js holder element or element id. */
  holder: string | HTMLElement;
  /** Data source for autocomplete candidates. */
  provider: MentionProvider;
  /** Trigger symbols that activate mention lookup. Defaults to `["@"]`. */
  triggerSymbols?: string[];
  /** Maximum autocomplete results. */
  maxResults?: number;
  /** Minimum query length after trigger before provider call. */
  minChars?: number;
  /** Debounce in milliseconds for provider calls. */
  debounceMs?: number;
  /** Optional custom dropdown root class name. */
  className?: string;
  /** Callback fired when mention is selected and inserted. */
  onSelect?: (item: MentionItem) => void;
  /** Custom HTML renderer for dropdown rows. */
  renderItem?: (item: MentionItem) => string;
  /** Hook to customize mention anchor rendering/styling in editor content. */
  renderMention?: (args: MentionRenderArgs) => void;
  /** Mutable external context consumed by `renderMention`. */
  mentionRenderContext?: unknown;
};

/**
 * Persisted mention entity stored alongside plain text content.
 *
 * @example
 * {
 *   "type": "mention",
 *   "id": "u-1002",
 *   "displayName": "Joanna Smith",
 *   "start": 0,
 *   "end": 13,
 *   "trigger": "@",
 *   "description": "Product Management",
 *   "image": "https://example.com/avatars/u-1002.png",
 *   "link": "https://example.local/users/u-1002"
 * }
 */
export type MentionEntity = {
  type: "mention";
  /** Stable backend identifier. */
  id: string;
  /** Display name at time of serialization. */
  displayName: string;
  /** Start offset (inclusive) in plain text. */
  start: number;
  /** End offset (exclusive) in plain text. */
  end: number;
  /** Trigger symbol used for rendering. */
  trigger?: string;
  /** Optional metadata copied from mention source. */
  description?: string;
  image?: string;
  link?: string;
};

/** Minimal Editor.js block shape used by serializer helpers. */
export type EditorJSBlockLike = {
  id?: string;
  type: string;
  data: Record<string, unknown>;
};

/** Minimal Editor.js output shape used by serializer helpers. */
export type EditorJSOutputLike = {
  time?: number;
  version?: string;
  blocks: EditorJSBlockLike[];
};
