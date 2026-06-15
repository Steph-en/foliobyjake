import axios from 'axios';
import { Category, Project, AnalyticsSummary, MediaAsset, ProjectStatus } from '../types';

const getEnv = (key: string): string | undefined => {
  return (import.meta as any).env?.[key];
};

const getBaseURL = (): string => {
  const envVal = getEnv('VITE_API_URL');
  if (!envVal) return '/api';
  
  const trimmed = envVal.trim().replace(/\/$/, '');
  if (trimmed.endsWith('/api')) {
    return trimmed;
  }
  return `${trimmed}/api`;
};

const client = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Check environment variables status (all are optional asco-hosted /api is the standard robust fallback)
export const validateClientEnv = () => {
  return {
    isValid: true,
    missing: [] as string[],
  };
};

// Attach optional mock-jwt auth token if stored in localStorage
client.interceptors.request.use((config) => {
  console.log(`[API Client] Requesting: ${config.method?.toUpperCase()} ${config.baseURL || ''}${config.url}`);
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Authentication
  login: async (username: string, password: string): Promise<{ success: boolean; token?: string; message?: string }> => {
    try {
      const { data } = await client.post('/auth/login', { username, password });
      return data;
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Authentication failed' };
    }
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    const { data } = await client.get('/categories');
    if (!Array.isArray(data)) {
      throw new Error(data?.error?.message || 'Invalid server response: categories list is not an array.');
    }
    return data;
  },
  createCategory: async (name: string): Promise<Category> => {
    const { data } = await client.post('/categories', { name });
    return data;
  },
  updateCategory: async (id: string, name: string): Promise<Category> => {
    const { data } = await client.put(`/categories/${id}`, { name });
    return data;
  },
  deleteCategory: async (id: string): Promise<{ success: boolean }> => {
    const { data } = await client.delete(`/categories/${id}`);
    return data;
  },

  // Projects
  getProjects: async (isAdmin = false): Promise<Project[]> => {
    const { data } = await client.get('/projects', { params: { view: isAdmin ? 'admin' : undefined } });
    if (!Array.isArray(data)) {
      throw new Error(data?.error?.message || 'Invalid server response: projects list is not an array.');
    }
    return data;
  },
  getProject: async (id: number, incrementView = false): Promise<Project> => {
    const { data } = await client.get(`/projects/${id}`, { params: { increment: incrementView ? 'true' : undefined } });
    return data;
  },
  createProject: async (project: Partial<Project>): Promise<Project> => {
    const { data } = await client.post('/projects', project);
    return data;
  },
  updateProject: async (id: number, project: Partial<Project>): Promise<Project> => {
    const { data } = await client.put(`/projects/${id}`, project);
    return data;
  },
  duplicateProject: async (id: number): Promise<Project> => {
    const { data } = await client.post(`/projects/${id}/duplicate`);
    return data;
  },
  deleteProject: async (id: number): Promise<{ success: boolean }> => {
    const { data } = await client.delete(`/projects/${id}`);
    return data;
  },

  // Media
  getMedia: async (): Promise<MediaAsset[]> => {
    const { data } = await client.get('/media');
    if (!Array.isArray(data)) {
      throw new Error(data?.error?.message || 'Invalid server response: media list is not an array.');
    }
    return data;
  },
  uploadMedia: async (media: { url: string; name: string; type?: 'image' | 'video' }): Promise<MediaAsset> => {
    const { data } = await client.post('/media', media);
    return data;
  },
  uploadMediaFile: async (file: File, name: string, onProgress?: (percent: number) => void): Promise<MediaAsset> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    const { data } = await client.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      }
    });
    return data;
  },
  deleteMedia: async (id: string): Promise<{ success: boolean }> => {
    const { data } = await client.delete(`/media/${id}`);
    return data;
  },

  // Contacts Click Aggregate
  incrementContactCount: async (): Promise<{ success: boolean }> => {
    const { data } = await client.post('/contacts/increment');
    return data;
  },

  // Analytics
  getAnalytics: async (): Promise<AnalyticsSummary> => {
    const { data } = await client.get('/analytics');
    return data;
  },
};