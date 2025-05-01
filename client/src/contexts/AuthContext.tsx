
import React, { createContext, useState, useEffect, useContext } from "react";
import { User,AuthUser } from "../types";
import { authenticate } from "../data/mockData";

interface AuthContextType {
  user: User | null;
  token:string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token:null,
  loading: true,
  login: () => Promise.resolve(false),
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<{
    user: User | null;
    token: string | null;
  }>({ user: null, token: null });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    
    if (savedUser && savedToken) {
      setAuthState({
        user: JSON.parse(savedUser),
        token: savedToken
      });
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const authData = authenticate(email, password);
      if (authData) {
        const { token, ...userData } = authData as AuthUser;
      setAuthState({ user: userData, token });
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", token);
      return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    setAuthState({ user: null, token: null });
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{
      user: authState.user,
      token: authState.token,
      loading,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};