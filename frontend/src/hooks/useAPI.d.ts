// TypeScript declarations for useAPI hooks

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  isActive: boolean;
  lastLogin?: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UseAPIResult {
  loading: boolean;
  error: string | null;
  execute: (apiCall: () => Promise<any>) => Promise<any>;
  get: (url: string, params?: any) => Promise<any>;
  post: (url: string, data?: any) => Promise<any>;
  put: (url: string, data?: any) => Promise<any>;
  del: (url: string) => Promise<any>;
}

export interface UseFetchResult<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UseAuthResult {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
}

// Hook exports
export declare const useAPI: () => UseAPIResult;
export declare const useFetch: <T = any>(apiCall: () => Promise<T>, dependencies?: any[]) => UseFetchResult<T>;
export declare const useAuth: () => UseAuthResult;
