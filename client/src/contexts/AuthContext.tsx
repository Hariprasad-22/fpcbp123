import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole } from "@/types";

interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing user session on app load
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("authToken");
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    try {
      // Mock login for now - in a real app this would call your API
      const mockUsers = {
        student: {
          id: "student1",
          fullName: "John Student",
          email: "student@college.edu",
          role: "student" as UserRole,
          password: "password123"
        },
        admin: {
          id: "admin1",
          fullName: "Admin User",
          email: "admin@college.edu",
          role: "admin" as UserRole,
          password: "admin123"
        }
      };

      const mockUser = role === "admin" ? mockUsers.admin : mockUsers.student;
      
      if (email === mockUser.email && password === mockUser.password) {
        // Create a token (this would normally come from your backend)
        const token = `Bearer mock-jwt-token-${Date.now()}`;
        
        // Save user info and token to localStorage
        const userToStore = {
          id: mockUser.id,
          fullName: mockUser.fullName,
          email: mockUser.email,
          role: mockUser.role
        };
        
        localStorage.setItem("user", JSON.stringify(userToStore));
        localStorage.setItem("authToken", token);
        
        setUser(userToStore);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};