import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export function healthCheck() {
  return api.get<{ status: string }>('/health');
}

export function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/upload', formData);
}

export function sendQuery(query: string) {
  return api.post('/query', { query });
}

export function runEda() {
  return api.post('/eda');
}

export function downloadCsv() {
  return api.get('/download', { responseType: 'blob' });
}

export default api;
