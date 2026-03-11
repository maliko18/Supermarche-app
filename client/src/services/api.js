import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

// Produits
export const getProduits = (categorie) =>
  api.get('/produits', { params: categorie ? { categorie } : {} }).then(r => r.data);

export const getProduit = (id) =>
  api.get(`/produits/${id}`).then(r => r.data);

export const createProduit = (data) =>
  api.post('/produits', data).then(r => r.data);

export const updateProduit = (id, data) =>
  api.put(`/produits/${id}`, data).then(r => r.data);

export const deleteProduit = (id) =>
  api.delete(`/produits/${id}`).then(r => r.data);

export const getAlertes = () =>
  api.get('/produits/alertes').then(r => r.data);

export const getCategories = () =>
  api.get('/produits/categories').then(r => r.data);

// IA
export const chatAI = (question) =>
  api.post('/ai/chat', { question }).then(r => r.data);

export const getRecommandations = () =>
  api.get('/ai/recommandations').then(r => r.data);
