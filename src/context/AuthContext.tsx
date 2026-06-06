import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import api from '../services/api';

// Define user types matching backend
export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'Tourist' | 'Farmer' | 'TourGuide' | 'TransportProvider' | 'Administrator';
  profilePic?: string;
  emailVerified: boolean;
  phoneNumber: string;
  countryOfResidence?: string;
  preferredLanguage?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Verify token and get user data from backend
          const response = await api.get('/auth/me');
          if (response.data.success) {
            // Transform _id to id for frontend consistency if needed, 
            // though our User interface uses id. 
            // Backend returns _id, we should map it or update interface.
            // Let's assume backend 'getMe' returns the mongoose object.
            const userData = response.data.data;
            setUser({ ...userData, id: userData._id });
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Auth check failed', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    // Optionally call backend logout
    api.post('/auth/logout').catch(err => console.error(err));
    localStorage.removeItem('token');
    setUser(null);
    // Redirect to login is handled by components or ProtectedRoute
  };

  const updateUser = (userData: User) => {
      setUser(userData);
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      loading, 
      login, 
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};