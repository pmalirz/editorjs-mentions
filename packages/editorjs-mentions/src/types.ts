export type MentionItem = {
  id: string;
  displayName: string;
  description?: string;
  image?: string;
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
};

