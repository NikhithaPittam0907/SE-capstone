import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

import { Pie } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

function Parking() {
  const [parking, setParking] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/parking")
      .then(res => setParking(res.data))
      .catch(err => console.log(err));
  }, []);

  const available = parking.filter(
    row => row[2] === "Available"
  ).length;

  const occupied = parking.filter(
    row => row[2] === "Occupied"
  ).length;

  const pieData = {
    labels: ["Available", "Occupied"],
    datasets: [
      {
        data: [available, occupied],
        backgroundColor: [
          "rgba(16, 185, 129, 0.8)",
          "rgba(239, 68, 68, 0.8)"
        ],
        borderColor: [
          "#10b981",
          "#ef4444"
        ],
        borderWidth: 1
      }
    ]
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            family: "'Plus Jakarta Sans', sans-serif",
            weight: '600'
          }
        }
      }
    }
  };

  return (
    <div className="page-container">
      <Sidebar />

      <div className="content-area">
        {/* Header */}
        <div style={{ marginBottom: "36px", borderBottom: "1px solid var(--border-color)", paddingBottom: "20px" }}>
          <h1 style={{ margin: 0, fontSize: "32px", fontWeight: "800", color: "var(--text-main)", letterSpacing: "-0.5px" }}>
            🅿️ Parking Management
          </h1>
          <p style={{ margin: "4px 0 0 0", color: "var(--text-muted)", fontSize: "14px", fontWeight: "500" }}>
            Real-time tracking of slot occupancy and zone status
          </p>
        </div>

        {/* Stats Grid */}
        <div className="stat-grid" style={{ gridTemplateColumns: "1fr 1fr", maxWidth: "600px" }}>
          <div
            className="card"
            style={{
              background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              display: "flex",
              alignItems: "center",
              gap: "20px",
              padding: "24px"
            }}
          >
            <span style={{ fontSize: "36px" }}>🟢</span>
            <div>
              <h3 style={{ margin: "0 0 4px 0", color: "#065f46", fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Available Slots
              </h3>
              <h1 style={{ margin: 0, fontSize: "32px", fontWeight: "800", color: "#065f46" }}>{available}</h1>
            </div>
          </div>

          <div
            className="card"
            style={{
              background: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              display: "flex",
              alignItems: "center",
              gap: "20px",
              padding: "24px"
            }}
          >
            <span style={{ fontSize: "36px" }}>🔴</span>
            <div>
              <h3 style={{ margin: "0 0 4px 0", color: "#991b1b", fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Occupied Slots
              </h3>
              <h1 style={{ margin: 0, fontSize: "32px", fontWeight: "800", color: "#991b1b" }}>{occupied}</h1>
            </div>
          </div>
        </div>

        {/* Content Layout Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "24px" }}>
          {/* Pie Chart Card */}
          <div className="card">
            <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", fontWeight: "700" }}>
              Occupancy Breakdown
            </h3>
            <div style={{ width: "100%", height: "280px" }}>
              <Pie data={pieData} options={pieOptions} />
            </div>
          </div>

          {/* Table Card */}
          <div className="card">
            <h3 style={{ margin: "0 0 10px 0", fontSize: "18px", fontWeight: "700" }}>
              Slot Status Registry
            </h3>

            <div className="premium-table-container">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Slot Name</th>
                    <th>Current Status</th>
                  </tr>
                </thead>
                <tbody>
                  {parking.map((row, index) => (
                    <tr key={index}>
                      <td style={{ fontWeight: "700" }}>{row[1]}</td>
                      <td>
                        <span className={row[2] === "Available" ? "badge badge-success" : "badge badge-danger"}>
                          {row[2] === "Available" ? "🟢 Available" : "🔴 Occupied"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Parking;