import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

function Analytics() {
  const [traffic, setTraffic] = useState([]);
  const [parking, setParking] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/traffic")
      .then(res => setTraffic(res.data));

    axios.get("http://localhost:5000/parking")
      .then(res => setParking(res.data));
  }, []);

  const trafficChart = {
    labels: traffic.map(row => row[1]),
    datasets: [
      {
        label: "Vehicle Count",
        data: traffic.map(row => row[2]),
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(139, 92, 246, 0.8)"
        ],
        borderColor: [
          "#3b82f6",
          "#10b981",
          "#f59e0b",
          "#ef4444",
          "#8b5cf6"
        ],
        borderWidth: 1,
        borderRadius: 8
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          font: {
            family: "'Plus Jakarta Sans', sans-serif",
            weight: "600"
          }
        }
      }
    }
  };

  const available = parking.filter(
    row => row[2] === "Available"
  ).length;

  const occupied = parking.filter(
    row => row[2] === "Occupied"
  ).length;

  const parkingChart = {
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

  return (
    <div className="page-container">
      <Sidebar />

      <div className="content-area">
        {/* Header */}
        <div style={{ marginBottom: "36px", borderBottom: "1px solid var(--border-color)", paddingBottom: "20px" }}>
          <h1 style={{ margin: 0, fontSize: "32px", fontWeight: "800", color: "var(--text-main)", letterSpacing: "-0.5px" }}>
            📊 Analytics Dashboard
          </h1>
          <p style={{ margin: "4px 0 0 0", color: "var(--text-muted)", fontSize: "14px", fontWeight: "500" }}>
            Aggregate statistical charts, traffic density indicators, and parking ratios
          </p>
        </div>

        {/* Analytics Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.3fr 1fr",
            gap: "24px"
          }}
        >
          {/* Traffic analytics */}
          <div className="card">
            <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", fontWeight: "700" }}>
              Traffic Density Analysis
            </h3>
            <div style={{ width: "100%", height: "350px" }}>
              <Bar data={trafficChart} options={chartOptions} />
            </div>
          </div>

          {/* Parking analytics */}
          <div className="card">
            <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", fontWeight: "700" }}>
              Parking Occupancy Ratio
            </h3>
            <div style={{ width: "100%", height: "350px" }}>
              <Pie data={parkingChart} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;