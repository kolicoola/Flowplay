import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext();
const BYPASS_AUTH = (import.meta.env.VITE_AUTH_BYPASS ?? 'false') === 'true';
const GUEST_USER = { id: 'guest-user', name: 'Guest User' };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null); // Contains only { id, public_settings }

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    setIsLoadingPublicSettings(true);
    setAuthError(null);
    setAppPublicSettings({ id: 'local', public_settings: {} });
    setIsLoadingPublicSettings(false);
    await checkUserAuth();
  };

  const checkUserAuth = async () => {
    try {
      if (BYPASS_AUTH) {
        setUser(GUEST_USER);
        setIsAuthenticated(true);
        setAuthError(null);
        setIsLoadingAuth(false);
        return;
      }

      // Now check if the user is authenticated
      setIsLoadingAuth(true);
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || GUEST_USER);
      setIsAuthenticated(true);
      setAuthError(null);
      setIsLoadingAuth(false);
    } catch (error) {
      console.error('User auth check failed:', error);
      // Never hard-block the app UI: fall back to guest mode.
      setUser(GUEST_USER);
      setIsAuthenticated(true);
      setAuthError(null);
      setIsLoadingAuth(false);
    }
  };

  const logout = (shouldRedirect = true) => {
    void shouldRedirect;
    setUser(null);
    setIsAuthenticated(false);
    supabase.auth.signOut();
  };

  const navigateToLogin = () => {
    // Local mode: no remote login flow.
    return;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
