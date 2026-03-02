import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signOut
} from 'firebase/auth';
import { auth as firebaseAuth, googleProvider, appleProvider } from '../firebase';
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

  const handleFirebaseResult = async (idToken) => {
    try {
      const response = await authAPI.firebaseLogin({ idToken });
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
      console.error('Firebase verify error:', error);
      // Extract nested details if they exist to pass to the UI
      const message = error.response?.data?.details || error.response?.data?.error || error.message || 'Firebase authentication failed';
      return { success: false, error: message };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const idToken = await result.user.getIdToken();
      return await handleFirebaseResult(idToken);
    } catch (error) {
      console.error('Google popup error:', error);
      const message = error.message || 'Google login popup failed';
      return { success: false, error: message };
    }
  };

  const loginWithApple = async () => {
    try {
      const result = await signInWithPopup(firebaseAuth, appleProvider);
      const idToken = await result.user.getIdToken();
      return await handleFirebaseResult(idToken);
    } catch (error) {
      console.error('Apple login error:', error);
      const message = error.response?.data?.error || error.message || 'Apple login failed';
      return { success: false, error: message };
    }
  };

  const loginWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const idToken = await result.user.getIdToken();
      return await handleFirebaseResult(idToken);
    } catch (error) {
      console.error('Email login error:', error);
      // Fallback: If Firebase fails, we can also try the direct backend login as a fallback
      // but normally we want to rely on Firebase if it's the primary provider.
      // E.g: Firebase Error: auth/user-not-found
      return { success: false, error: error.message || 'Email login failed' };
    }
  };

  const setupRecaptcha = (containerId) => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, containerId, {
        'size': 'invisible',
      });
    }
  };

  const sendOtp = async (phoneNumber, containerId) => {
    try {
      setupRecaptcha(containerId);
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(firebaseAuth, phoneNumber, appVerifier);
      window.confirmationResult = confirmationResult;
      return { success: true };
    } catch (error) {
      console.error('OTP Send error:', error);
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
      return { success: false, error: error.message || 'Failed to send OTP' };
    }
  };

  const verifyOtp = async (otp) => {
    try {
      const result = await window.confirmationResult.confirm(otp);
      const idToken = await result.user.getIdToken();
      return await handleFirebaseResult(idToken);
    } catch (error) {
      console.error('OTP Verify error:', error);
      return { success: false, error: error.message || 'Invalid OTP' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    signOut(firebaseAuth).catch(() => { });
  };

  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0a0e1a' }}><div className="spinner"></div></div>;
  }

  return (
    <AuthContext.Provider value={{
      user, token,
      loginWithGoogle,
      loginWithApple,
      loginWithEmail,
      sendOtp,
      verifyOtp,
      logout,
      isAdmin,
      isAuthenticated: !!token && !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};
