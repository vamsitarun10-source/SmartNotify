import React, { useState, useEffect, useCallback, createContext, useContext } from "react";
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getToken,
  getCurrentUser,
  type User,
} from "../services/auth";

interface AuthState {
  isAuthenticated: boolean | null;
  user: User | null;
  login: (email: string, password: string) => Promise<any>;
  register: (name: string, email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const checkAuth = useCallback(async () => {
    const token = await getToken();
    if (token) {
      setIsAuthenticated(true);
      setUser(await getCurrentUser());
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await apiLogin(email, password);
      setUser(res.user);
      setIsAuthenticated(true);
      return res;
    },
    []
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await apiRegister(name, email, password);
      setUser(res.user);
      setIsAuthenticated(true);
      return res;
    },
    []
  );

  const logout = useCallback(async () => {
    await apiLogout();
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
