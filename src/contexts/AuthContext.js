import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      setIsAuthenticated(true);
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = async (credentials) => {
    setIsLoading(true);
    try {
      await api.post('/auth/login', credentials);
      await fetchMe();
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data) => {
    setIsLoading(true);
    try {
      await api.post('/auth/register', data);
      await fetchMe();
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout issue', err);
    }
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
