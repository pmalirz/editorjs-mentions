import type { MentionItem, MentionProvider, MentionProviderFn, MentionQuery } from "./types";

export function normalizeProvider(provider: MentionProvider): MentionProviderFn {
  if (typeof provider === "function") {
    return provider;
  }

  return provider.search.bind(provider);
}

export type RestProviderOptions = {
  endpoint: string;
  queryParam?: string;
  triggerParam?: string;
  limitParam?: string;
  fetchInit?: RequestInit;
  mapResponse?: (json: unknown) => MentionItem[];
};

export function createRestMentionProvider(options: RestProviderOptions): MentionProviderFn {
  const queryParam = options.queryParam ?? "query";
  const triggerParam = options.triggerParam ?? "trigger";
  const limitParam = options.limitParam ?? "limit";

  return async (query: MentionQuery): Promise<MentionItem[]> => {
    const url = new URL(options.endpoint, window.location.origin);
    url.searchParams.set(queryParam, query.query);
    url.searchParams.set(triggerParam, query.trigger);
    url.searchParams.set(limitParam, String(query.limit));

    const response = await fetch(url.toString(), options.fetchInit);
    if (!response.ok) {
      throw new Error(`Mention provider request failed: ${response.status}`);
    }

    const json = (await response.json()) as unknown;
    if (options.mapResponse) {
      return options.mapResponse(json);
    }

    if (typeof json !== "object" || json === null || !("items" in json)) {
      return [];
    }

    const maybeItems = (json as { items?: MentionItem[] }).items;
    return Array.isArray(maybeItems) ? maybeItems : [];
  };
}
