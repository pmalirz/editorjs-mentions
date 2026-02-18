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

export interface MentionSource {
  search(query: MentionQuery): Promise<MentionItem[]>;
}

