// hooks/useAuth.js
import { useState, useEffect, useCallback } from "react";
import { login as apiLogin, logout as apiLogout, getToken } from "../services/api";

export default function useAuth() {
  const [user, setUser] = useState(() => {
    const stored = sessionStorage.getItem("user") || localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (email, password, role) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiLogin(email, password, role);
      setUser(data.user);
      setLoading(false);
      return data.user;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  }, []);

  const logout = useCallback(() => {
    apiLogout();
    setUser(null);
    sessionStorage.removeItem("user");
    // compat
    localStorage.removeItem("user");
  }, []);

  const isAuthenticated = !!user;

  return { user, login, logout, loading, error, isAuthenticated };
}
