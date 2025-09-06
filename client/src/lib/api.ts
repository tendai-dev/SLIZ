// Simple API client without authentication complexity
export const apiRequest = async (
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> => {
  const headers: Record<string, string> = {
    ...(data ? { "Content-Type": "application/json" } : {}),
  };

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }

  return res;
};

export const useApiRequest = () => {
  return apiRequest;
};
