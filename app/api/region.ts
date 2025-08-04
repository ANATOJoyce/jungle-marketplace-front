// api/region.ts
import axios from 'axios';

const API_URL = 'http://localhost:3000/regions'; // Adaptez selon votre configuration

export const RegionApi = {
  // Régions
  listRegions: (query?: any) => axios.get(`${API_URL}`, { params: query }),
  createRegion: (data: any) => axios.post(`${API_URL}`, data),
  updateRegion: (id: string, data: any) => axios.patch(`${API_URL}/${id}`, data),
  deleteRegion: (id: string) => axios.delete(`${API_URL}/${id}`),
  softDeleteRegion: (id: string) => axios.patch(`${API_URL}/${id}/soft-delete`),
  restoreRegion: (id: string) => axios.patch(`${API_URL}/${id}/restore`),
  retrieveRegion: (id: string) => axios.get(`${API_URL}/${id}`),

  // Pays
  listCountries: (query?: any) => axios.get(`${API_URL}/countries`, { params: query }),
  createCountry: (data: any) => axios.post(`${API_URL}/create-country`, data),
  updateCountry: (id: string, data: any) => axios.put(`${API_URL}/countries/${id}`, data),
  deleteCountry: (id: string) => axios.delete(`${API_URL}/countries/${id}`),
  retrieveCountry: (id: string) => axios.get(`${API_URL}/countries/${id}`),
};