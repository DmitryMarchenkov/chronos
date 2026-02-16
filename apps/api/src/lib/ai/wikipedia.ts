type WikipediaSearchResponse = {
  query?: {
    search?: Array<{
      title: string;
      snippet?: string;
    }>;
  };
};

type WikipediaSummaryResponse = {
  title?: string;
  extract?: string;
  content_urls?: {
    desktop?: {
      page?: string;
    };
  };
};

export type WikipediaSummary = {
  title: string | null;
  extract: string | null;
  url: string | null;
};

const DEFAULT_TIMEOUT_MS = 4000;

const fetchJson = async <T>(url: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<T> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Wikipedia request failed (${response.status})`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
};

const toRestTitle = (title: string) => encodeURIComponent(title.split(' ').join('_'));

export const getWikipediaSummary = async (query: string): Promise<WikipediaSummary> => {
  const normalized = query.trim();
  if (!normalized) {
    return { title: null, extract: null, url: null };
  }

  const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&srsearch=${encodeURIComponent(
    normalized
  )}`;

  const search = await fetchJson<WikipediaSearchResponse>(searchUrl);
  const title = search.query?.search?.[0]?.title;
  if (!title) {
    return { title: null, extract: null, url: null };
  }

  const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${toRestTitle(title)}`;
  const summary = await fetchJson<WikipediaSummaryResponse>(summaryUrl);

  return {
    title: summary.title ?? title,
    extract: summary.extract ?? null,
    url: summary.content_urls?.desktop?.page ?? null,
  };
};

