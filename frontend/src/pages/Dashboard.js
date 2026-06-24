import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [traffic, setTraffic] = useState([]);
  const [parking, setParking] = useState([]);
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    const loadData = () => {
      axios.get("http://localhost:5000/traffic")
        .then(res => setTraffic(res.data))
        .catch(err => console.log(err));

      axios.get("http://localhost:5000/parking")
        .then(res => setParking(res.data))
        .catch(err => console.log(err));

      axios.get("http://localhost:5000/routes")
        .then(res => setRoutes(res.data))
        .catch(err => console.log(err));
    };

    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const congested = traffic.filter(
    row => row[4] === "Congested"
  ).length;

  const available = parking.filter(
    row => row[2] === "Available"
  ).length;

  return (
    <div className="page-container">
      <Sidebar />

      <div className="content-area">
        {/* Header Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "36px",
            borderBottom: "1px solid var(--border-color)",
            paddingBottom: "20px"
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: "32px", fontWeight: "800", color: "var(--text-main)", letterSpacing: "-0.5px" }}>
              📊 Control Dashboard
            </h1>
            <p style={{ margin: "4px 0 0 0", color: "var(--text-muted)", fontSize: "14px", fontWeight: "500" }}>
              Real-time monitoring and analytics at a glance
            </p>
          </div>

          <button
            onClick={() => {
              localStorage.removeItem("isLoggedIn");
              localStorage.removeItem("role");
              localStorage.removeItem("userName");
              localStorage.removeItem("userEmail");
              navigate("/");
            }}
            className="btn-danger"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              fontSize: "14px"
            }}
          >
            <span>➔</span> Logout
          </button>
        </div>

        {/* Stats Grid */}
        <div className="stat-grid">
          {/* Card 1 */}
          <div
            className="card"
            style={{
              background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              height: "150px"
            }}
          >
            <div>
              <span style={{ fontSize: "24px" }}>🚗</span>
              <h3 style={{ margin: "8px 0 0 0", color: "#1e3a8a", fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Traffic Areas
              </h3>
            </div>
            <h1 style={{ margin: 0, fontSize: "36px", fontWeight: "800", color: "#1e3a8a" }}>
              {traffic.length}
            </h1>
          </div>

          {/* Card 2 */}
          <div
            className="card"
            style={{
              background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              height: "150px"
            }}
          >
            <div>
              <span style={{ fontSize: "24px" }}>🅿️</span>
              <h3 style={{ margin: "8px 0 0 0", color: "#065f46", fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Available Parking
              </h3>
            </div>
            <h1 style={{ margin: 0, fontSize: "36px", fontWeight: "800", color: "#065f46" }}>
              {available}
            </h1>
          </div>

          {/* Card 3 */}
          <div
            className="card"
            style={{
              background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
              border: "1px solid rgba(245, 158, 11, 0.2)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              height: "150px"
            }}
          >
            <div>
              <span style={{ fontSize: "24px" }}>🗺️</span>
              <h3 style={{ margin: "8px 0 0 0", color: "#78350f", fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Active Routes
              </h3>
            </div>
            <h1 style={{ margin: 0, fontSize: "36px", fontWeight: "800", color: "#78350f" }}>
              {routes.length}
            </h1>
          </div>

          {/* Card 4 */}
          <div
            className="card"
            style={{
              background: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              height: "150px"
            }}
          >
            <div>
              <span style={{ fontSize: "24px" }}>🔴</span>
              <h3 style={{ margin: "8px 0 0 0", color: "#991b1b", fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Congested Areas
              </h3>
            </div>
            <h1 style={{ margin: 0, fontSize: "36px", fontWeight: "800", color: "#991b1b" }}>
              {congested}
            </h1>
          </div>
        </div>

        {/* Project Summary Section */}
        <div className="card" style={{ padding: "32px", background: "white" }}>
          <h2 style={{ margin: "0 0 16px 0", fontSize: "22px", fontWeight: "800", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "10px" }}>
            <span>🚀</span> Capstone Project Overview
          </h2>
          
          <p style={{ margin: "0 0 24px 0", color: "var(--text-muted)", fontSize: "15px", lineHeight: "1.7", fontWeight: "500" }}>
            The <strong>Smart City Traffic & Parking Management System</strong> utilizes real-time IoT monitoring, advanced route calculations, and state-of-the-art slot reservation models. By optimizing vehicle navigation and automating parking allocations, this system minimizes urban congestion, reduces average transit delay times, and lowers overall carbon emissions.
          </p>

          <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: "700", color: "var(--text-main)" }}>
            Key Architecture Modules
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
              <span style={{ fontWeight: "700", color: "#1e3a8a", fontSize: "14px", display: "block", marginBottom: "4px" }}>🚦 Real-time Traffic Tracking</span>
              <span style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.5" }}>Live simulation of vehicle counts, traffic patterns, and bottlenecks across main intersections.</span>
            </div>
            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
              <span style={{ fontWeight: "700", color: "#065f46", fontSize: "14px", display: "block", marginBottom: "4px" }}>🅿️ Smart Parking Reservation</span>
              <span style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.5" }}>Automated location mapping to calculate and lock spot reservations for waiting drivers.</span>
            </div>
            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
              <span style={{ fontWeight: "700", color: "#78350f", fontSize: "14px", display: "block", marginBottom: "4px" }}>🗺️ Interactive OSRM Mapping</span>
              <span style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.5" }}>Leaflet Routing Machine integration displaying real-time visual route bounds and path lines.</span>
            </div>
            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
              <span style={{ fontWeight: "700", color: "#581c87", fontSize: "14px", display: "block", marginBottom: "4px" }}>📊 Analytics Dashboard</span>
              <span style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.5" }}>Interactive Chart.js visualizations for analyzing dataset trends and metrics.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;