import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('safebridge_token') || null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCrossing, setActiveCrossing] = useState(null);

  // Intent persistence for deep link authentication preservation
  const setPendingScanIntent = (intent) => {
    if (intent) {
      sessionStorage.setItem('safebridge_pending_scan', JSON.stringify(intent));
    } else {
      sessionStorage.removeItem('safebridge_pending_scan');
    }
  };

  const getPendingScanIntent = () => {
    const saved = sessionStorage.getItem('safebridge_pending_scan');
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  };

  const clearPendingScanIntent = () => {
    sessionStorage.removeItem('safebridge_pending_scan');
  };

  const fetchActiveCrossing = useCallback(async () => {
    if (!localStorage.getItem('safebridge_token')) {
      setActiveCrossing(null);
      return;
    }
    try {
      const res = await api.crossings.getActive();
      setActiveCrossing(res.data);
    } catch (err) {
      setActiveCrossing(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem('safebridge_token')) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const res = await api.auth.getMe();
      setUser(res.data);
      await fetchActiveCrossing();
    } catch (err) {
      console.warn('Session expired or invalid:', err.message);
      localStorage.removeItem('safebridge_token');
      setToken(null);
      setUser(null);
      setActiveCrossing(null);
    } finally {
      setIsLoading(false);
    }
  }, [fetchActiveCrossing]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Periodic active crossing check (every 5 seconds if active)
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      fetchActiveCrossing();
    }, 6000);
    return () => clearInterval(interval);
  }, [user, fetchActiveCrossing]);

  const login = async (email, password) => {
    const res = await api.auth.login(email, password);
    const newToken = res.data.token;
    localStorage.setItem('safebridge_token', newToken);
    setToken(newToken);
    setUser(res.data.user);
    await fetchActiveCrossing();
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await api.auth.register(name, email, password);
    const newToken = res.data.token;
    localStorage.setItem('safebridge_token', newToken);
    setToken(newToken);
    setUser(res.data.user);
    await fetchActiveCrossing();
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('safebridge_token');
    setToken(null);
    setUser(null);
    setActiveCrossing(null);
    clearPendingScanIntent();
  };

  const value = {
    user,
    token,
    isLoading,
    activeCrossing,
    login,
    register,
    logout,
    refreshUser,
    refreshActiveCrossing: fetchActiveCrossing,
    setPendingScanIntent,
    getPendingScanIntent,
    clearPendingScanIntent,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
