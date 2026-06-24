import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

function RoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [result, setResult] = useState("");
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/routes")
      .then(res => {
        setRoutes(res.data);
        const uniquePlaces = Array.from(new Set(res.data.flatMap(row => [row[1], row[2]]))).sort();
        setPlaces(uniquePlaces);
      })
      .catch(err => console.log(err));
  }, []);

  const findRoute = () => {
    const route = routes.find(
      r => r[1] === source && r[2] === destination
    );

    if (route) {
      setResult({
        success: true,
        source,
        destination,
        distance: route[3]
      });
    } else {
      setResult({
        success: false,
        message: "Route Not Found"
      });
    }
  };

  return (
    <div className="page-container">
      <Sidebar />

      <div className="content-area">
        {/* Header */}
        <div style={{ marginBottom: "36px", borderBottom: "1px solid var(--border-color)", paddingBottom: "20px" }}>
          <h1 style={{ margin: 0, fontSize: "32px", fontWeight: "800", color: "var(--text-main)", letterSpacing: "-0.5px" }}>
            🧭 Route Optimizer
          </h1>
          <p style={{ margin: "4px 0 0 0", color: "var(--text-muted)", fontSize: "14px", fontWeight: "500" }}>
            Query optimized routes between intersections and calculate transit distances
          </p>
        </div>

        {/* Query Card */}
        <div className="card">
          <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "700" }}>
            Select Route Path
          </h3>
          
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
              alignItems: "center"
            }}
          >
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="premium-select"
            >
              <option value="">Select Source Junction</option>
              {places.map((place, idx) => (
                <option key={idx} value={place}>{place}</option>
              ))}
            </select>

            <span style={{ color: "var(--text-muted)", fontWeight: "bold" }}>➔</span>

            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="premium-select"
            >
              <option value="">Select Destination Junction</option>
              {places.map((place, idx) => (
                <option key={idx} value={place}>{place}</option>
              ))}
            </select>

            <button onClick={findRoute} className="btn-primary">
              🚀 Calculate Path
            </button>
          </div>
        </div>

        {/* Calculation Result Banner */}
        {result && (
          <div
            className="card"
            style={{
              background: result.success ? "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)" : "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
              border: result.success ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(239, 68, 68, 0.2)",
              padding: "20px 24px",
              color: result.success ? "#14532d" : "#991b1b"
            }}
          >
            {result.success ? (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "24px" }}>✅</span>
                <div>
                  <h4 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: "700" }}>Optimal Route Found</h4>
                  <span style={{ fontSize: "14px", fontWeight: "600" }}>
                    Best Route: <strong>{result.source}</strong> to <strong>{result.destination}</strong> | Distance: <strong>{result.distance} km</strong>
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "24px" }}>⚠️</span>
                <div>
                  <h4 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: "700" }}>Route Search Failed</h4>
                  <span style={{ fontSize: "14px", fontWeight: "600" }}>{result.message}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Database Table Card */}
        <div className="card" style={{ marginTop: "24px" }}>
          <h3 style={{ margin: "0 0 10px 0", fontSize: "18px", fontWeight: "700" }}>
            Optimized Distance Registry
          </h3>

          <div className="premium-table-container">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Origin Junction</th>
                  <th>Destination Junction</th>
                  <th>Distance (km)</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((row, index) => (
                  <tr key={index}>
                    <td style={{ fontWeight: "700", color: "#1e3a8a" }}>{row[1]}</td>
                    <td style={{ fontWeight: "700", color: "#065f46" }}>{row[2]}</td>
                    <td style={{ fontWeight: "800" }}>{row[3]} km</td>
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

export default RoutesPage;