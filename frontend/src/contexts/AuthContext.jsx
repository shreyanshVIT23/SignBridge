import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // Validate credentials (in a real app, this would be more secure)
    if (email === 'user@example.com' && password === 'password') {
      const userData = {
        email: 'user@example.com',
        name: 'Demo User',
        authenticated: true
      };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return true;
    }
    throw new Error('Invalid credentials');
  };

  const register = (name, email, password) => {
    // Validate registration (in a real app, this would be more secure)
    if (email && password && name) {
      const userData = {
        email,
        name,
        authenticated: true
      };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return true;
    }
    throw new Error('Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
