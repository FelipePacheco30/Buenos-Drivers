import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/login";
import Driver from "./pages/driver/home";
import PrivateRoute from "./routes/PrivateRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />

      <Route path="/login" element={<Login />} />

      <Route
        path="/driver"
        element={
          <PrivateRoute>
            <Driver />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;
