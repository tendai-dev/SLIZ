// Simple API client without authentication complexity
export async function apiRequest(method: string, endpoint: string, data?: any) {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data && Object.keys(data).length > 0) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(endpoint, options);

  if (!response.ok) {
    const text = await response.text();
    let errorMessage = `API request failed: ${response.statusText}`;
    try {
      const json = JSON.parse(text);
      errorMessage = json.message || errorMessage;
    } catch {
      errorMessage = text || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response;
};

export const useApiRequest = () => {
  return apiRequest;
};
