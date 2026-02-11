import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import DriverLayout from "../layouts/DriverLayout";
import AdminLayout from "../layouts/AdminLayout";
import PrivateRoute from "./PrivateRoute";

import Login from "../pages/auth/Login";
import DriverHome from "../pages/driver/Home";
import DriverAccount from "../pages/driver/Account";
import DriverMessages from "../pages/driver/Messages";
import DriverWallet from "../pages/driver/Wallet";
import DriverTest from "../pages/driver/Test";
import AdminDashboard from "../pages/admin/Dashboard";
import AdminDrivers from "../pages/admin/Drivers";
import AdminRequests from "../pages/admin/Requests";
import AdminMessages from "../pages/admin/Messages";
import AdminRenewals from "../pages/admin/Renewals";

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

        {/* ROTAS PROTEGIDAS ADMIN */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="drivers" element={<AdminDrivers />} />
          <Route path="drivers/:driverId" element={<AdminDrivers />} />
          <Route path="requests" element={<AdminRequests />} />
          <Route path="requests/:requestId" element={<AdminRequests />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="messages/:driverId" element={<AdminMessages />} />
          <Route path="renewals" element={<AdminRenewals />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
