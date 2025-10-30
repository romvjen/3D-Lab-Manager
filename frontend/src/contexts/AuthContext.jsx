import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * Authentication Context
 * Provides authentication state and methods throughout the app
 * TODO: Connect to Supabase authentication when backend is ready
 */

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = () => {
      // TODO: Replace with Supabase session check
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password, role = 'viewer') => {
    // TODO: Replace with Supabase authentication
    // For now, simulate login
    const mockUser = {
      id: '1',
      email: email,
      firstName: 'Demo',
      lastName: 'User',
      role: role, // Add role support
    };

    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
    return { success: true };
  };

  // Signup function
  const signup = async (userData) => {
    // TODO: Replace with Supabase authentication
    // For now, simulate signup
    const mockUser = {
      id: '1',
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role || 'viewer',
    };

    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
    return { success: true };
  };

  // Logout function
  const logout = () => {
    // TODO: Replace with Supabase sign out
    setUser(null);
    localStorage.removeItem('user');
  };

  // Change role (for testing/demo purposes)
  const changeRole = (newRole) => {
    if (user) {
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    changeRole,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
