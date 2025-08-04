import { json } from "@remix-run/node";

type ApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
};

export async function fetchFromApi<T>(
  endpoint: string,
  { method = 'GET', body, headers = {} }: ApiOptions = {}
): Promise<T> {
  const apiUrl = `${process.env.NEST_API_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(apiUrl, {
    method,
    headers: { ...defaultHeaders, ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'API request failed');
  }

  return response.json();
}

export function handleApiError(error: unknown) {
  console.error('API Error:', error);
  return json(
    { error: error instanceof Error ? error.message : 'Unknown error' },
    { status: 500 }
  );
}