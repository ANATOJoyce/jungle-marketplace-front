// app/api/productApi.ts
import axios from 'axios';

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000/product';

export const productApi = {
  getAll: () => axios.get(`${API_BASE_URL}`),
  getById: (id: string) => axios.get(`${API_BASE_URL}/${id}`),
  create: (data: any) => axios.post(`${API_BASE_URL}`, data),
  update: (id: string, data: any) => axios.put(`${API_BASE_URL}/${id}`, data),
  delete: (id: string) => axios.delete(`${API_BASE_URL}/${id}`),

  revertDraft: (id: string) => axios.put(`${API_BASE_URL}/${id}/revert-draft`),
  propose: (id: string) => axios.put(`${API_BASE_URL}/${id}/propose`),
  publish: (id: string) => axios.put(`${API_BASE_URL}/${id}/publish`),
  reject: (id: string) => axios.put(`${API_BASE_URL}/${id}/reject`),

  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`${API_BASE_URL}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getPaginated: (params: any) => axios.get(`${API_BASE_URL}/public/pagination`, { params }),

  recommend: (budget: number) =>
    axios.get(`${API_BASE_URL}/recommendations`, { params: { budget } }),

  softDelete: (id: string) => axios.patch(`${API_BASE_URL}/${id}/soft-delete`),
  restore: (id: string) => axios.post(`${API_BASE_URL}/${id}/restore`),

  createByPhone: (phone: string, product: any) =>
    axios.post(`${API_BASE_URL}/create-by-phone`, { phone, product }),

  // More endpoints for categories, tags, variants, etc. can be added similarly.
};
