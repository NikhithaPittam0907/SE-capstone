import { useState, useEffect } from "react";
import axios from "axios";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import RoutingMachine from "../components/RoutingMachine";
import Sidebar from "../components/Sidebar";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
  Tooltip
} from "react-leaflet";

window.L = L;

const parkingIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3177/3177361.png",
  iconSize: [35, 35]
});

function SmartMap() {
  const [position, setPosition] = useState([13.0827, 80.2707]);
  const [parking, setParking] = useState([]);
  const [junctions, setJunctions] = useState([]);
  const [traffic, setTraffic] = useState([]);

  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [routeInfo, setRouteInfo] = useState("");

  const [sourceCoords, setSourceCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);

  const [currentNearestParking, setCurrentNearestParking] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookedParking, setBookedParking] = useState(null);
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (location) => {
        setPosition([location.coords.latitude, location.coords.longitude]);
      },
      (error) => {
        console.log(error);
      }
    );

    axios.get("http://localhost:5000/parking-map")
      .then((res) => setParking(res.data))
      .catch((err) => console.log(err));

    axios.get("http://localhost:5000/junctions")
      .then((res) => setJunctions(res.data))
      .catch((err) => console.log(err));

    axios.get("http://localhost:5000/traffic")
      .then((res) => setTraffic(res.data))
      .catch((err) => console.log(err));
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const findNearestParking = (destinationLat, destinationLon) => {
    let nearestParking = null;
    let minDistance = Infinity;

    parking.forEach((p) => {
      const distance = calculateDistance(
        destinationLat,
        destinationLon,
        Number(p[2]),
        Number(p[3])
      );

      if (distance < minDistance && p[4] > 0) {
        minDistance = distance;
        nearestParking = p;
      }
    });

    return nearestParking;
  };

  const findRoute = () => {
    if (!source || !destination) {
      alert("Please select Source and Destination");
      return;
    }

    const sourceJunction = junctions.find((j) => j[1] === source);
    const destinationJunction = junctions.find((j) => j[1] === destination);

    if (!sourceJunction || !destinationJunction) {
      return;
    }

    const sourceLat = Number(sourceJunction[2]);
    const sourceLon = Number(sourceJunction[3]);
    const destinationLat = Number(destinationJunction[2]);
    const destinationLon = Number(destinationJunction[3]);

    setSourceCoords([sourceLat, sourceLon]);
    setDestinationCoords([destinationLat, destinationLon]);

    const distance = calculateDistance(
      sourceLat,
      sourceLon,
      destinationLat,
      destinationLon
    );

    const eta = Math.round(distance * 2);

    const nearestParking = findNearestParking(
      destinationJunction[2],
      destinationJunction[3]
    );

    setRouteInfo(
      "Route: " +
        source +
        " → " +
        destination +
        " | Distance: " +
        distance.toFixed(2) +
        " km | ETA: " +
        eta +
        " min | Nearest Parking: " +
        (nearestParking ? nearestParking[1] : "Not Available") +
        " | Available Slots: " +
        (nearestParking ? nearestParking[4] : 0)
    );

    setRouteData({
      source,
      destination,
      distance: distance.toFixed(2),
      eta
    });
    setCurrentNearestParking(nearestParking);
    setBookedParking(null);
    setBookingError("");
  };

  const bookParkingSlot = async () => {
    if (!currentNearestParking) return;
    setIsBooking(true);
    setBookingError("");
    try {
      const response = await axios.post("http://localhost:5000/book-parking", {
        parking_id: currentNearestParking[0]
      });
      if (response.data.success) {
        setBookedParking({
          id: currentNearestParking[0],
          name: response.data.parking_name,
          ticket: response.data.ticket,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        // Re-fetch parking locations to update markers
        axios
          .get("http://localhost:5000/parking-map")
          .then((res) => {
            setParking(res.data);
            const updated = res.data.find(p => p[0] === currentNearestParking[0]);
            if (updated) {
              setCurrentNearestParking(updated);
            }
          });
      } else {
        setBookingError(response.data.error || "Booking failed.");
      }
    } catch (err) {
      console.error(err);
      setBookingError(err.response?.data?.error || "Error booking parking slot. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  const getTrafficColor = (junctionName) => {
    const trafficRecord = traffic.find((t) => t[1] === junctionName);
    if (!trafficRecord) return "green";
    const status = trafficRecord[4];
    if (status === "Congested") return "red";
    if (status === "Moderate") return "orange";
    return "green";
  };

  return (
    <div className="page-container">
      <Sidebar />

      <div className="content-area">
        {/* Header */}
        <div style={{ marginBottom: "36px", borderBottom: "1px solid var(--border-color)", paddingBottom: "20px" }}>
          <h1 style={{ margin: 0, fontSize: "32px", fontWeight: "800", color: "var(--text-main)", letterSpacing: "-0.5px" }}>
            🗺️ Smart Map Control Center
          </h1>
          <p style={{ margin: "4px 0 0 0", color: "var(--text-muted)", fontSize: "14px", fontWeight: "500" }}>
            Monitor real-time traffic speeds, available parking, and route optimization paths
          </p>
        </div>

        {/* Stats Grid */}
        <div className="stat-grid">
          <div className="card" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 20px" }}>
            <span style={{ fontSize: "28px" }}>🚦</span>
            <div>
              <span style={{ display: "block", color: "var(--text-muted)", fontSize: "13px", fontWeight: "600", textTransform: "uppercase" }}>Junctions</span>
              <span style={{ fontSize: "24px", fontWeight: "800" }}>{junctions.length}</span>
            </div>
          </div>
          
          <div className="card" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 20px" }}>
            <span style={{ fontSize: "28px" }}>🅿️</span>
            <div>
              <span style={{ display: "block", color: "var(--text-muted)", fontSize: "13px", fontWeight: "600", textTransform: "uppercase" }}>Parking Lots</span>
              <span style={{ fontSize: "24px", fontWeight: "800" }}>{parking.length}</span>
            </div>
          </div>

          <div className="card" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 20px" }}>
            <span style={{ fontSize: "28px" }}>🔴</span>
            <div>
              <span style={{ display: "block", color: "var(--text-muted)", fontSize: "13px", fontWeight: "600", textTransform: "uppercase" }}>Congested</span>
              <span style={{ fontSize: "24px", fontWeight: "800" }}>
                {traffic.filter((t) => t[4] === "Congested").length}
              </span>
            </div>
          </div>

          <div className="card" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 20px" }}>
            <span style={{ fontSize: "28px" }}>🛣️</span>
            <div>
              <span style={{ display: "block", color: "var(--text-muted)", fontSize: "13px", fontWeight: "600", textTransform: "uppercase" }}>Routes</span>
              <span style={{ fontSize: "24px", fontWeight: "800" }}>5</span>
            </div>
          </div>
        </div>

        {/* Query Card */}
        <div className="card" style={{ padding: "20px 24px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "700" }}>Query Traffic Route</h3>
          <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="premium-select"
              style={{ minWidth: "260px" }}
            >
              <option value="">Select Source Junction</option>
              {junctions.map((j) => (
                <option key={j[0]} value={j[1]}>{j[1]}</option>
              ))}
            </select>

            <span style={{ color: "var(--text-muted)", fontWeight: "bold" }}>➔</span>

            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="premium-select"
              style={{ minWidth: "260px" }}
            >
              <option value="">Select Destination Junction</option>
              {junctions.map((j) => (
                <option key={j[0]} value={j[1]}>{j[1]}</option>
              ))}
            </select>

            <button onClick={findRoute} className="btn-primary">
              🚀 Find Best Route
            </button>
          </div>
        </div>

        {/* Route Info & Booking Banner */}
        {routeData && (
          <div
            style={{
              marginBottom: "25px",
              padding: "24px",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              borderRadius: "16px",
              boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.08)",
              border: "1px solid rgba(226, 232, 240, 0.8)",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
              alignItems: "stretch"
            }}
          >
            {/* Left Column: Route Summary */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                borderRight: "1px solid #e2e8f0",
                paddingRight: "24px"
              }}
            >
              <div>
                <h3 style={{ margin: "0 0 16px 0", color: "#1e293b", fontSize: "18px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>🗺️</span> Route Summary
                </h3>
                
                {/* Route Flow */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                  <div style={{ background: "#eff6ff", color: "#2563eb", padding: "8px 16px", borderRadius: "10px", fontWeight: "600", fontSize: "15px", border: "1px solid #dbeafe" }}>
                    {routeData.source}
                  </div>
                  <span style={{ color: "#64748b", fontWeight: "bold", fontSize: "18px" }}>→</span>
                  <div style={{ background: "#f0fdf4", color: "#16a34a", padding: "8px 16px", borderRadius: "10px", fontWeight: "600", fontSize: "15px", border: "1px solid #dcfce7" }}>
                    {routeData.destination}
                  </div>
                </div>
              </div>

              {/* Distance & ETA Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                  <span style={{ display: "block", color: "#64748b", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", marginBottom: "4px" }}>Distance</span>
                  <span style={{ color: "#0f172a", fontSize: "20px", fontWeight: "800" }}>{routeData.distance} <span style={{ fontSize: "14px", fontWeight: "500", color: "#64748b" }}>km</span></span>
                </div>
                <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                  <span style={{ display: "block", color: "#64748b", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", marginBottom: "4px" }}>Estimated Time (ETA)</span>
                  <span style={{ color: "#0f172a", fontSize: "20px", fontWeight: "800" }}>{routeData.eta} <span style={{ fontSize: "14px", fontWeight: "500", color: "#64748b" }}>mins</span></span>
                </div>
              </div>
            </div>

            {/* Right Column: Parking Status & Booking */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              {bookedParking ? (
                /* Success Ticket UI */
                <div
                  style={{
                    background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
                    border: "1px dashed #4ade80",
                    borderRadius: "12px",
                    padding: "20px",
                    position: "relative",
                    boxShadow: "0 4px 12px rgba(22, 163, 74, 0.05)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center"
                  }}
                >
                  <div style={{ background: "#22c55e", color: "white", width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", marginBottom: "12px", lineHeight: "40px" }}>
                    ✓
                  </div>
                  <h4 style={{ margin: "0 0 6px 0", color: "#14532d", fontSize: "16px", fontWeight: "700" }}>
                    Parking Reserved Successfully!
                  </h4>
                  <p style={{ margin: "0 0 16px 0", color: "#166534", fontSize: "13px" }}>
                    Your spot is secured at <strong>{bookedParking.name}</strong>. Move when traffic reduces.
                  </p>

                  {/* Ticket Details */}
                  <div style={{ display: "flex", width: "100%", justifyContent: "space-between", background: "white", padding: "8px 16px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px", fontFamily: "monospace", color: "#475569" }}>
                    <span>TICKET: <strong>{bookedParking.ticket}</strong></span>
                    <span>BOOKED: <strong>{bookedParking.time}</strong></span>
                  </div>
                </div>
              ) : currentNearestParking ? (
                /* Booking Action UI */
                <div>
                  <h3 style={{ margin: "0 0 8px 0", color: "#1e293b", fontSize: "18px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>🅿️</span> Nearest Parking Slot
                  </h3>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", margin: "12px 0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "#475569", fontWeight: "600" }}>Location:</span>
                      <span style={{ color: "#0f172a", fontWeight: "700" }}>{currentNearestParking[1]}</span>
                    </div>
                    
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "#475569", fontWeight: "600" }}>Availability:</span>
                      <span style={{ 
                        color: currentNearestParking[4] > 5 ? "#16a34a" : currentNearestParking[4] > 0 ? "#d97706" : "#dc2626", 
                        fontWeight: "800",
                        background: currentNearestParking[4] > 5 ? "#f0fdf4" : currentNearestParking[4] > 0 ? "#fef3c7" : "#fef2f2",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontSize: "14px"
                      }}>
                        {currentNearestParking[4] > 0 ? `${currentNearestParking[4]} Slots Left` : "FULL"}
                      </span>
                    </div>
                  </div>

                  {bookingError && (
                    <div style={{ color: "#dc2626", background: "#fef2f2", border: "1px solid #fee2e2", padding: "8px 12px", borderRadius: "8px", fontSize: "13px", marginBottom: "12px" }}>
                      ⚠️ {bookingError}
                    </div>
                  )}

                  <button
                    disabled={isBooking || currentNearestParking[4] <= 0}
                    onClick={bookParkingSlot}
                    style={{
                      width: "100%",
                      background: currentNearestParking[4] <= 0 ? "#94a3b8" : "linear-gradient(135deg, #059669, #10b981)",
                      color: "white",
                      border: "none",
                      padding: "12px 20px",
                      borderRadius: "10px",
                      fontSize: "15px",
                      fontWeight: "bold",
                      cursor: currentNearestParking[4] <= 0 ? "not-allowed" : "pointer",
                      boxShadow: currentNearestParking[4] <= 0 ? "none" : "0px 4px 12px rgba(16, 185, 129, 0.3)",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px"
                    }}
                    onMouseOver={(e) => {
                      if (currentNearestParking[4] > 0) {
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.boxShadow = "0px 6px 16px rgba(16, 185, 129, 0.4)";
                      }
                    }}
                    onMouseOut={(e) => {
                      if (currentNearestParking[4] > 0) {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0px 4px 12px rgba(16, 185, 129, 0.3)";
                      }
                    }}
                  >
                    {isBooking ? (
                      <>⏳ Securing Spot...</>
                    ) : currentNearestParking[4] <= 0 ? (
                      <>❌ No Slots Available</>
                    ) : (
                      <>🎫 Book Parking Slot Now</>
                    )}
                  </button>
                </div>
              ) : (
                /* No parking available UI */
                <div style={{ background: "#fef2f2", border: "1px solid #fee2e2", borderRadius: "12px", padding: "20px", display: "flex", alignItems: "center", gap: "12px", color: "#991b1b" }}>
                  <span style={{ fontSize: "24px" }}>⚠️</span>
                  <div>
                    <h4 style={{ margin: "0 0 4px 0", fontWeight: "700" }}>No Parking Available</h4>
                    <p style={{ margin: 0, fontSize: "13px", color: "#b91c1c" }}>We couldn't find any parking facilities near your destination.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Map Container Card */}
        <div className="card" style={{ padding: "10px", borderRadius: "20px", overflow: "hidden" }}>
          <MapContainer
            center={position}
            zoom={11}
            style={{
              height: "650px",
              width: "100%",
              borderRadius: "12px"
            }}
          >
            <TileLayer
              attribution="OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={position}>
              <Popup>📍 Your Current Location</Popup>
            </Marker>

            {parking.map((p, index) => (
              <Marker
                key={index}
                icon={parkingIcon}
                position={[Number(p[2]), Number(p[3])]}
              >
                <Popup>
                  <h3 style={{ margin: "0 0 6px 0", fontSize: "15px", fontWeight: "700" }}>{p[1]}</h3>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: "500" }}>Available Slots: <strong>{p[4]}</strong></p>
                </Popup>
              </Marker>
            ))}

            {junctions.map((j, index) => (
              <CircleMarker
                key={index}
                center={[Number(j[2]), Number(j[3])]}
                radius={10}
                pathOptions={{
                  color: getTrafficColor(j[1]),
                  fillColor: getTrafficColor(j[1]),
                  fillOpacity: 0.8
                }}
              >
                <Popup>{j[1]}</Popup>
                <Tooltip permanent direction="top">🚦 {j[1]}</Tooltip>
              </CircleMarker>
            ))}

            {sourceCoords && destinationCoords && (
              <RoutingMachine
                source={sourceCoords}
                destination={destinationCoords}
                sourceName={source}
                destinationName={destination}
              />
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

export default SmartMap;