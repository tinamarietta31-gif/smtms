import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth as firebaseAuth, googleProvider } from '../firebase';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      if (savedToken && savedUser) {
        try {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        } catch (e) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const loginWithGoogle = async () => {
    try {
      // Step 1: Sign in with Google via Firebase popup
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const idToken = await result.user.getIdToken();

      // Step 2: Send the Firebase ID token to our backend for verification
      const response = await authAPI.googleLogin({ idToken });
      const data = response.data;
      const newToken = data.token;
      const newUser = data.user;

      if (!newToken || !newUser) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      return { success: true };
    } catch (error) {
      console.error('Google login error:', error);
      const message = error.response?.data?.error || error.message || 'Google login failed';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    // Also sign out of Firebase
    signOut(firebaseAuth).catch(() => { });
  };

  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0a0e1a' }}><div className="spinner"></div></div>;
  }

  return (
    <AuthContext.Provider value={{ user, token, loginWithGoogle, logout, isAdmin, isAuthenticated: !!token && !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
