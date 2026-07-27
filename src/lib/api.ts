import axios from 'axios';
import { Category, Project, AnalyticsSummary, MediaAsset, ProjectStatus } from '../types';

const getEnv = (key: string): string | undefined => {
  return (import.meta as any).env?.[key];
};

const getBaseURL = (): string => {
  const envVal = getEnv('VITE_API_URL');
  
  // If VITE_API_URL is empty or not set, use relative path (recommended for same-origin requests)
  if (!envVal || envVal.trim() === '') {
    return '/api';
  }
  
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
  // Allow credentials for same-origin requests
  withCredentials: true,
});

// Check environment variables status (all are optional as co-hosted /api is the standard robust fallback)
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

// Better error handling
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 404) {
      console.error(`[API Error] 404 Not Found: ${error.config?.url}`);
    }
    if (error.response?.status === 500) {
      console.error(`[API Error] 500 Server Error: ${error.config?.url}`);
    }
    if (!error.response) {
      console.error(`[API Error] Network Error: ${error.message} for ${error.config?.url}`);
    }
    throw error;
  }
);

// Local storage helper keys & logic
const STORAGE_PROJECTS_KEY = 'jake_portfolio_projects_v2';

const getLocalProjects = (): Project[] | null => {
  try {
    const raw = localStorage.getItem(STORAGE_PROJECTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed to read local projects:', e);
  }
  return null;
};

const saveLocalProjects = (projects: Project[]) => {
  try {
    localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(projects));
  } catch (e) {
    console.warn('Failed to save local projects:', e);
  }
};

const areProjectsEqual = (a: Project[], b: Project[]): boolean => {
  if (a.length !== b.length) return false;
  const bMap = new Map(b.map(p => [p.id, p]));
  for (const itemA of a) {
    const itemB = bMap.get(itemA.id);
    if (!itemB) return false;
    if (
      itemA.status !== itemB.status ||
      itemA.name !== itemB.name ||
      itemA.isFeatured !== itemB.isFeatured ||
      JSON.stringify(itemA.gallery) !== JSON.stringify(itemB.gallery)
    ) {
      return false;
    }
  }
  return true;
};

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
    try {
      const { data } = await client.get('/projects', { params: { view: 'admin' } });
      if (Array.isArray(data)) {
        saveLocalProjects(data);
        if (isAdmin) {
          return data;
        } else {
          return data.filter(p => p.status === 'published');
        }
      } else {
        throw new Error('Invalid server response: projects list is not an array.');
      }
    } catch (err) {
      console.warn('[API Client] getProjects error, falling back to local storage:', err);
      const localProjs = getLocalProjects();
      if (localProjs) {
        if (isAdmin) return localProjs;
        return localProjs.filter(p => p.status === 'published');
      }
      throw err;
    }
  },
  getProject: async (id: number, incrementView = false): Promise<Project> => {
    const { data } = await client.get(`/projects/${id}`, { params: { increment: incrementView ? 'true' : undefined } });
    return data;
  },
  createProject: async (project: Partial<Project>): Promise<Project> => {
    const { data } = await client.post('/projects', project);
    const local = getLocalProjects() || [];
    const updated = [data, ...local.filter(p => p.id !== data.id)];
    saveLocalProjects(updated);
    return data;
  },
  updateProject: async (id: number, project: Partial<Project>): Promise<Project> => {
    const { data } = await client.put(`/projects/${id}`, project);
    const local = getLocalProjects() || [];
    const updated = local.map(p => (p.id === id ? data : p));
    saveLocalProjects(updated);
    return data;
  },
  duplicateProject: async (id: number): Promise<Project> => {
    const { data } = await client.post(`/projects/${id}/duplicate`);
    const local = getLocalProjects() || [];
    const updated = [data, ...local];
    saveLocalProjects(updated);
    return data;
  },
  deleteProject: async (id: number): Promise<{ success: boolean }> => {
    const { data } = await client.delete(`/projects/${id}`);
    const local = getLocalProjects() || [];
    const updated = local.filter(p => p.id !== id);
    saveLocalProjects(updated);
    return data;
  },
  reorderProjects: async (orderedIds: number[]): Promise<Project[]> => {
    try {
      const { data } = await client.post('/projects/reorder', { orderedIds });
      const newProjs = Array.isArray(data?.projects) ? data.projects : (Array.isArray(data) ? data : null);
      if (newProjs) {
        saveLocalProjects(newProjs);
        return newProjs;
      }
    } catch (err) {
      console.warn('[API Client] reorderProjects server call failed, falling back to local reorder:', err);
    }
    const local = getLocalProjects() || [];
    const map = new Map(local.map(p => [p.id, p]));
    const reordered: Project[] = [];
    for (const id of orderedIds) {
      if (map.has(id)) {
        reordered.push(map.get(id)!);
        map.delete(id);
      }
    }
    for (const p of map.values()) {
      reordered.push(p);
    }
    saveLocalProjects(reordered);
    return reordered;
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