import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import DriverLayout from "../layouts/DriverLayout";
import AdminLayout from "../layouts/AdminLayout";
import PrivateRoute from "./PrivateRoute";

import Login from "../pages/auth/Login";
import DriverHome from "../pages/driver/Home";
import DriverAccount from "../pages/driver/Account";
import DriverMessages from "../pages/driver/Messages";
import DriverWallet from "../pages/driver/Wallet";
import DriverRenewals from "../pages/driver/Renewals";
import AdminDashboard from "../pages/admin/Dashboard";
import AdminDrivers from "../pages/admin/Drivers";
import AdminRequests from "../pages/admin/Requests";
import AdminMessages from "../pages/admin/Messages";
import AdminRenewals from "../pages/admin/Renewals";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);
  return null;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        <Route
          path="/driver"
          element={
            <PrivateRoute>
              <DriverLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<DriverHome />} />
          <Route path="account" element={<DriverAccount />} />
          <Route path="messages" element={<DriverMessages />} />
          <Route path="wallet" element={<DriverWallet />} />
          <Route path="renewals" element={<DriverRenewals />} />
        </Route>

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
          <Route path="renewals/:renewalId" element={<AdminRenewals />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
