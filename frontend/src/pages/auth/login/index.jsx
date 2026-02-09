import React, { useEffect, useState } from 'react';
import './styles.css';

export default function Login() {
  const [role, setRole] = useState('DRIVER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="login-page">
      <div className={`login-card ${animate ? 'show' : ''}`}>
        {/* LADO BANDEIRA */}
        <div className="flag-area">
          <div className="sun" />
        </div>

        {/* LADO FORM */}
        <form className="form-area" onSubmit={handleSubmit}>
          <h1 className="title">
            <span className="blue">Buenos</span>{' '}
            <span className="yellow">Drivers</span>
          </h1>

          <div className="field">
            <label>Tipo de acesso</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="USER">Usuário</option>
              <option value="DRIVER">Motorista</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>

          <div className="field">
            <label>Email</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label>Senha</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                className="eye"
                onClick={() => setShowPassword(!showPassword)}
              >
                👁
              </span>
            </div>
          </div>

          <button type="submit">Entrar</button>
        </form>
      </div>
    </div>
  );
}
