import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

function buildPreviewUser(role = "DRIVER") {
  const base = {
    id: "00000000-0000-0000-0000-000000000001",
    name: role === "ADMIN" ? "Admin Preview" : "Motorista Preview",
    email: role === "ADMIN" ? "admin.preview@buenos.local" : "driver.preview@buenos.local",
    role,
    status: "ACTIVE",
    city: "Buenos Aires",
    reputation_score: 4.4,
    is_preview: true,
    driver: {
      total_trips: 32,
      daily_earnings: 18.5,
    },
  };

  return base;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser =
      sessionStorage.getItem("user") || localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  function login(data) {
    setUser(data);
    sessionStorage.setItem("user", JSON.stringify(data));
    localStorage.removeItem("user");
    sessionStorage.removeItem("preview_mode");
    sessionStorage.removeItem("preview_role");
  }

  function loginPreview(initialRole = "DRIVER") {
    const u = buildPreviewUser(initialRole);
    setUser(u);
    sessionStorage.setItem("user", JSON.stringify(u));
    sessionStorage.setItem("preview_mode", "1");
    sessionStorage.setItem("preview_role", u.role);
    sessionStorage.removeItem("token");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  function setPreviewRole(nextRole) {
    setUser((prev) => {
      if (!prev?.is_preview) return prev;
      const u = { ...prev, role: nextRole };
      if (nextRole === "ADMIN") {
        u.name = "Admin Preview";
        u.email = "admin.preview@buenos.local";
      } else {
        u.name = "Motorista Preview";
        u.email = "driver.preview@buenos.local";
      }
      sessionStorage.setItem("user", JSON.stringify(u));
      sessionStorage.setItem("preview_role", u.role);
      return u;
    });
  }

  function logout() {
    setUser(null);
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("preview_mode");
    sessionStorage.removeItem("preview_role");
    sessionStorage.removeItem("preview_wallet");
    
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isPreview: !!user?.is_preview,
        login,
        loginPreview,
        setPreviewRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
