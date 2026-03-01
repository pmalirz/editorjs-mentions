import type { MentionItem, MentionProvider, MentionProviderFn, MentionQuery } from "./types";

export function normalizeProvider(provider: MentionProvider): MentionProviderFn {
  if (typeof provider === "function") {
    return provider;
  }

  return provider.search.bind(provider);
}

/**
 * Configuration options for the REST mention provider.
 */
export type RestProviderOptions = {
  /** The URL endpoint to query mentions. */
  endpoint: string;
  /** Name of the URL query parameter used for search text. Defaults to "query". */
  queryParam?: string;
  /** Name of the URL query parameter used for trigger symbol. Defaults to "trigger". */
  triggerParam?: string;
  /** Name of the URL query parameter used for max results limit. Defaults to "limit". */
  limitParam?: string;
  /** Additional initialization options for the `fetch` API call. */
  fetchInit?: RequestInit;
  /**
   * Custom mapping function that converts the response json into an array of `MentionItem`s.
   * If not provided, defaults to looking for an `items` array property in the JSON.
   */
  mapResponse?: (json: unknown) => MentionItem[];
};

/**
 * Creates a mention provider that fetches data from a REST endpoint.
 * @param options - Configuration for the REST provider.
 */
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

