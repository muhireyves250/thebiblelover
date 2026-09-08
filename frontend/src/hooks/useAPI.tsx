import React, { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import { getCached, setCached, dedupedFetch } from '../lib/dataCache';

// Custom hook for API calls with loading states and error handling
export const useAPI = <T = any,>() => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (apiCall: () => Promise<T>): Promise<T> => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      return result;
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, execute };
};

// Custom hook for fetching data
export const useFetch = <T = any,>(apiCall: () => Promise<T>, dependencies: any[] = []) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
};

// Cached fetch: shows cached data immediately (no loading spinner) when available,
// so navigating back to a page you've already visited feels instant, while quietly
// revalidating in the background if the cached data has gone stale. Concurrent
// callers with the same `key` (e.g. two components mounting at once) share a single
// in-flight network request instead of duplicating it.
export function useCachedFetch<T = any>(
  key: string | null,
  apiCall: () => Promise<T>,
  options?: { ttl?: number }
) {
  const ttl = options?.ttl ?? 5 * 60 * 1000; // 5 minutes
  const apiCallRef = useRef(apiCall);
  apiCallRef.current = apiCall;

  const initial = key ? getCached<T>(key) : undefined;
  const [data, setData] = useState<T | null>(initial ? initial.data : null);
  const [loading, setLoading] = useState<boolean>(!initial);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (silent = false) => {
    if (!key) return;
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const result = await dedupedFetch(key, () => apiCallRef.current());
      setData(result);
      setCached(key, result);
      if (!silent) setError(null);
    } catch (err: any) {
      if (!silent) setError(err.message || 'Failed to fetch data');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [key]);

  useEffect(() => {
    if (!key) return;
    const entry = getCached<T>(key);
    if (entry) {
      setData(entry.data);
      setLoading(false);
      if (Date.now() - entry.timestamp > ttl) {
        fetchData(true); // stale — refresh quietly in the background
      }
    } else {
      fetchData(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const refetch = useCallback(() => fetchData(false), [fetchData]);

  return { data, loading, error, refetch };
}

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  console.log('AuthProvider is rendering');
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const checkAuth = useCallback(() => {
    try {
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (userStr && token) {
        const userData = JSON.parse(userStr);
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Auth sync error:', err);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    checkAuth();

    // Listen for storage changes (e.g., logout in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'token') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [checkAuth]);

  const login = (userData: any, token: string) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isInitialized, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for authentication state
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};





