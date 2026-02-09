import React, { createContext, useState, useEffect, useContext } from "react";
import * as api from "../services/api";

// Cria contexto
const AuthContext = createContext();

// Provider que envolve a aplicação
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ao iniciar, tenta recuperar usuário do localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Função de login
  const login = async (email, password) => {
    const user = await api.login(email, password);
    setUser(user);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("role", user.role);
    return user;
  };

  // Função de logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("role");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar o AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth precisa estar dentro de um AuthProvider");
  }
  return context;
}
