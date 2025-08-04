import { RegionInput, RegionUpdate } from "~/types";
import { Currency, Region } from "~/types/country";

// src/utils/apiClient.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:3000';

interface ApiError {
  message: string;
  statusCode: number;
}

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include' // Pour les cookies si nécessaire
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || `Erreur ${response.status}`);
  }

  return response.json();
}


// ... (le reste du code apiClient reste le même)

export const regionService = {
  getAll: () => fetchApi<Region[]>('/api/regions'),
  getById: (id: string) => fetchApi<Region>(`/api/regions/${id}`),
  create: (data: RegionInput) => fetchApi<Region>('/api/regions', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id: string, data: RegionUpdate) => fetchApi<Region>(`/api/regions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),
  delete: (id: string) => fetchApi(`/api/regions/${id}`, { method: 'DELETE' })
};

// Méthodes pour les devises
export const currencyService = {
  getAll: () => fetchApi<Currency[]>('/api/currencies')
};