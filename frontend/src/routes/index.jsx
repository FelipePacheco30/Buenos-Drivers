import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import AuthLayout from '../layouts/AuthLayout';
import Login from '../pages/auth/login';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota raiz SEMPRE vai para login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Rotas públicas (auth) */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Rotas protegidas entram depois */}
      </Routes>
    </BrowserRouter>
  );
}
