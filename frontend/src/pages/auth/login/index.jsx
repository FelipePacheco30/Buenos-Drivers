import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { setToken as setApiToken } from "../../../services/api";
import "./styles.css";

export default function Login() {
  const navigate = useNavigate();
  const { login: setAuthUser } = useAuth();

  const [role, setRole] = useState("DRIVER");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setAnimate(true);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3333/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Credenciais inválidas");
      }

      // salva token e atualiza contexto de autenticação
      setApiToken(data.token);
      setAuthUser(data.user);

      // também salva role separadamente (útil)
      sessionStorage.setItem("role", data.user.role);
      localStorage.removeItem("role");

      alert("Login realizado com sucesso 🚀");

      // REDIRECIONAMENTO REAL
      if (data.user.role === "DRIVER") {
        navigate("/driver", { replace: true });
      } else if (data.user.role === "ADMIN") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className={`login-card ${animate ? "show" : ""}`}>
        <div className="flag-area">
          <div className="sun" />
        </div>

        <form className="form-area" onSubmit={handleSubmit}>
          <h2 className="title">
            <span className="blue">Buenos</span>{" "}
            <span className="yellow">Drivers</span>
          </h2>

          <label>Tipo de acesso</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={loading}
          >
            <option value="USER">Usuário</option>
            <option value="DRIVER">Motorista</option>
            <option value="ADMIN">Administrador</option>
          </select>

          <label>Email</label>
          <input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />

          <label>Senha</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
            <span className="eye" onClick={() => setShowPassword(!showPassword)}>
              👁
            </span>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Entrando…" : "Entrar"}
          </button>

          {error && <div className="error-message">{error}</div>}
        </form>
      </div>
    </div>
  );
}
