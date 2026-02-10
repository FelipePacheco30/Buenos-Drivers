import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import DriverLayout from "../layouts/DriverLayout";
import PrivateRoute from "./PrivateRoute";

import Login from "../pages/auth/Login";
import DriverHome from "../pages/driver/Home";
import DriverAccount from "../pages/driver/Account";
import DriverMessages from "../pages/driver/Messages";
import DriverWallet from "../pages/driver/Wallet";
import DriverTest from "../pages/driver/Test";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* RAIZ */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* ROTAS PÚBLICAS */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* ROTAS PROTEGIDAS DRIVER */}
        <Route
          path="/driver"
          element={
            <PrivateRoute>
              <DriverLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<DriverHome />} />
          <Route path="test" element={<DriverTest />} />
          <Route path="account" element={<DriverAccount />} />
          <Route path="messages" element={<DriverMessages />} />
          <Route path="wallet" element={<DriverWallet />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
