import {apiService} from '../lib/axios';
import type React from 'react';
import {createContext, useContext, useState, useEffect} from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'author';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: {email: string; password: string}) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setIsLoading(false);
  }, []);

  const login = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    const {data} = await apiService.login({
      email: email,
      password: password,
    });
    console.log(data);
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{user, token, login, logout, isLoading}}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
