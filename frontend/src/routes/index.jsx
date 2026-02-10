import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import DriverLayout from "../layouts/DriverLayout";

import Login from "../pages/auth/login";

import DriverHome from "../pages/driver/Home";
import DriverMessages from "../pages/driver/Messages";
import DriverWallet from "../pages/driver/Wallet";
import DriverAccount from "../pages/driver/Account";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🔁 Rota raiz */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 🔓 Rotas públicas */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* 🔒 Rotas do motorista */}
        <Route element={<DriverLayout />}>
          <Route path="/driver" element={<DriverHome />} />
          <Route path="/driver/messages" element={<DriverMessages />} />
          <Route path="/driver/wallet" element={<DriverWallet />} />
          <Route path="/driver/account" element={<DriverAccount />} />
        </Route>

        {/* ❌ fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
