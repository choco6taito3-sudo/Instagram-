export const GRAPH_API_VERSION = "v21.0";
export const BASE_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

export class GraphApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: number
  ) {
    super(message);
    this.name = "GraphApiError";
  }
}

export async function graphFetch<T>(
  accessToken: string,
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const separator = path.includes("?") ? "&" : "?";
  const url = `${BASE_URL}${path}${separator}access_token=${accessToken}`;
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) {
    throw new GraphApiError(
      data?.error?.message || `Instagram API error: ${res.status}`,
      res.status,
      data?.error?.code
    );
  }
  return data as T;
}

export async function graphFetchJson<T>(
  accessToken: string,
  path: string,
  body: unknown
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}?access_token=${accessToken}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new GraphApiError(
      data?.error?.message || `Instagram API error: ${res.status}`,
      res.status,
      data?.error?.code
    );
  }
  return data as T;
}
