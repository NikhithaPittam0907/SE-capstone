import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Traffic() {
  const [traffic, setTraffic] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/traffic")
      .then(res => setTraffic(res.data))
      .catch(err => console.log(err));
  }, []);

  const chartData = {
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
        position: 'top',
        labels: {
          font: {
            family: "'Plus Jakarta Sans', sans-serif",
            weight: '600'
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(226, 232, 240, 0.5)"
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  const getBadgeClass = (status) => {
    if (status === "Congested") return "badge badge-danger";
    if (status === "Moderate") return "badge badge-warning";
    return "badge badge-success";
  };

  return (
    <div className="page-container">
      <Sidebar />

      <div className="content-area">
        {/* Header */}
        <div style={{ marginBottom: "36px", borderBottom: "1px solid var(--border-color)", paddingBottom: "20px" }}>
          <h1 style={{ margin: 0, fontSize: "32px", fontWeight: "800", color: "var(--text-main)", letterSpacing: "-0.5px" }}>
            🚗 Traffic Monitoring
          </h1>
          <p style={{ margin: "4px 0 0 0", color: "var(--text-muted)", fontSize: "14px", fontWeight: "500" }}>
            Real-time vehicle density analytics and flow classification
          </p>
        </div>

        {/* Chart Card */}
        <div className="card">
          <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", fontWeight: "700" }}>
            Vehicle Count by Junction
          </h3>
          <div style={{ width: "100%", height: "350px" }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Table Card */}
        <div className="card">
          <h3 style={{ margin: "0 0 10px 0", fontSize: "18px", fontWeight: "700" }}>
            Intersection Status Registry
          </h3>
          
          <div className="premium-table-container">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Location</th>
                  <th>Vehicle Count</th>
                  <th>Avg Speed</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {traffic.map((row, index) => (
                  <tr key={index}>
                    <td style={{ fontWeight: "700" }}>{row[1]}</td>
                    <td>{row[2]} vehicles</td>
                    <td>{row[3]} km/h</td>
                    <td>
                      <span className={getBadgeClass(row[4])}>
                        {row[4] === "Congested" ? "🔴 " : row[4] === "Moderate" ? "🟡 " : "🟢 "}
                        {row[4]}
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
  );
}

export default Traffic;