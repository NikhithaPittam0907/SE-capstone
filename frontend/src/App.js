import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import SmartMap from "./pages/SmartMap";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Traffic from "./pages/Traffic";
import Parking from "./pages/Parking";
import RoutesPage from "./pages/Routes";
import Analytics from "./pages/Analytics";

function ProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route path="/map" element={<ProtectedRoute><SmartMap /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/traffic" element={<ProtectedRoute><Traffic /></ProtectedRoute>} />
        <Route path="/parking" element={<ProtectedRoute><Parking /></ProtectedRoute>} />
        <Route path="/routes" element={<ProtectedRoute><RoutesPage /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;