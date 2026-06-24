import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();

  const getLinkStyle = (path) => {
    const isActive = location.pathname === path;
    return {
      color: isActive ? "#38bdf8" : "#cbd5e1",
      textDecoration: "none",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "14px 20px",
      borderRadius: "12px",
      marginBottom: "8px",
      background: isActive ? "rgba(56, 189, 248, 0.08)" : "transparent",
      borderLeft: isActive ? "4px solid #38bdf8" : "4px solid transparent",
      fontWeight: isActive ? "700" : "500",
      fontSize: "15px",
      transition: "all 0.2s ease",
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    };
  };

  return (
    <div
      style={{
        width: "260px",
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
        color: "white",
        padding: "24px 16px",
        boxShadow: "4px 0 25px rgba(0, 0, 0, 0.15)",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        height: "100vh"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", marginBottom: "30px" }}>
        <span style={{ fontSize: "28px" }}>🚦</span>
        <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "800", background: "linear-gradient(135deg, #38bdf8, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          SmartCity
        </h2>
      </div>

      <div style={{ flex: 1 }}>
        <Link to="/dashboard" style={getLinkStyle("/dashboard")}>
          <span style={{ fontSize: "18px" }}>📊</span> Dashboard
        </Link>

        <Link to="/map" style={getLinkStyle("/map")}>
          <span style={{ fontSize: "18px" }}>🗺️</span> Smart Map
        </Link>

        <Link to="/traffic" style={getLinkStyle("/traffic")}>
          <span style={{ fontSize: "18px" }}>🚗</span> Traffic Info
        </Link>

        <Link to="/parking" style={getLinkStyle("/parking")}>
          <span style={{ fontSize: "18px" }}>🅿️</span> Parking Lots
        </Link>

        <Link to="/routes" style={getLinkStyle("/routes")}>
          <span style={{ fontSize: "18px" }}>🧭</span> Route Optimizer
        </Link>

        <Link to="/analytics" style={getLinkStyle("/analytics")}>
          <span style={{ fontSize: "18px" }}>📈</span> Analytics
        </Link>
      </div>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "16px", fontSize: "12px", color: "#64748b", textAlign: "center", fontWeight: "600" }}>
        Capstone Project © 2026
      </div>
    </div>
  );
}

export default Sidebar;