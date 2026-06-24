import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import RoutingMachine from "../components/RoutingMachine";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
  Tooltip
} from "react-leaflet";

window.L = L;
const initialCenter = [13.0827, 80.2707];
const parkingIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3177/3177361.png",
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -34]
});

function SmartMap() {
  const [position, setPosition] = useState(initialCenter);
  const [parking, setParking] = useState([]);
  const [junctions, setJunctions] = useState([]);
  const [traffic, setTraffic] = useState([]);
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [routeInfo, setRouteInfo] = useState("");
  const [sourceCoords, setSourceCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (location) => {
        setPosition([location.coords.latitude, location.coords.longitude]);
      },
      () => {
        setPosition(initialCenter);
      }
    );

    Promise.all([
      axios.get("http://localhost:5000/parking-map"),
      axios.get("http://localhost:5000/junctions"),
      axios.get("http://localhost:5000/traffic")
    ])
      .then(([parkingRes, junctionRes, trafficRes]) => {
        setParking(parkingRes.data);
        setJunctions(junctionRes.data);
        setTraffic(trafficRes.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const normalTrafficCount = useMemo(
    () => traffic.filter((record) => record[4] === "Normal").length,
    [traffic]
  );

  const moderateTrafficCount = useMemo(
    () => traffic.filter((record) => record[4] === "Moderate").length,
    [traffic]
  );

  const congestedTrafficCount = useMemo(
    () => traffic.filter((record) => record[4] === "Congested").length,
    [traffic]
  );

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const findNearestParking = (destinationLat, destinationLon) => {
    let nearestParking = null;
    let minDistance = Infinity;

    parking.forEach((parkingSpot) => {
      const distance = calculateDistance(
        destinationLat,
        destinationLon,
        Number(parkingSpot[2]),
        Number(parkingSpot[3])
      );

      if (distance < minDistance && Number(parkingSpot[4]) > 0) {
        minDistance = distance;
        nearestParking = parkingSpot;
      }
    });

    return nearestParking;
  };

  const getTrafficColor = (junctionName) => {
    const trafficRecord = traffic.find((record) => record[1] === junctionName);
    if (!trafficRecord) {
      return "green";
    }

    const status = trafficRecord[4];
    if (status === "Congested") {
      return "red";
    }
    if (status === "Moderate") {
      return "orange";
    }
    return "green";
  };

  const findRoute = () => {
    if (!source || !destination) {
      alert("Please select Source and Destination");
      return;
    }

    const sourceJunction = junctions.find((junction) => junction[1] === source);
    const destinationJunction = junctions.find((junction) => junction[1] === destination);

    if (!sourceJunction || !destinationJunction) {
      alert("Unable to find selected junctions. Please try again.");
      return;
    }

    const sourceLat = Number(sourceJunction[2]);
    const sourceLon = Number(sourceJunction[3]);
    const destinationLat = Number(destinationJunction[2]);
    const destinationLon = Number(destinationJunction[3]);

    setSourceCoords([sourceLat, sourceLon]);
    setDestinationCoords([destinationLat, destinationLon]);

    const distance = calculateDistance(sourceLat, sourceLon, destinationLat, destinationLon);
    const eta = Math.max(1, Math.round(distance * 2));
    const nearestParking = findNearestParking(destinationLat, destinationLon);

    setRouteInfo(
      `Route: ${source} → ${destination} | Distance: ${distance.toFixed(2)} km | ETA: ${eta} min | Nearest Parking: ${
        nearestParking ? nearestParking[1] : "Not Available"
      } | Available Slots: ${nearestParking ? nearestParking[4] : 0}`
    );
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      <header
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: "20px",
          alignItems: "flex-start",
          marginBottom: "24px"
        }}
      >
        <div>
          <p style={{ margin: 0, color: "#1976d2", fontWeight: 700, letterSpacing: "0.05em" }}>
            Smart City Dashboard
          </p>
          <h1 style={{ margin: "8px 0 0", fontSize: "2.4rem", lineHeight: 1.1, color: "#102a43" }}>
            🚦 Smart City Traffic Control Center
          </h1>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
            gap: "16px",
            width: "100%",
            maxWidth: "700px"
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #ffffff, #eff6ff)",
              padding: "18px",
              borderRadius: "14px",
              boxShadow: "0 10px 30px rgba(16, 40, 67, 0.08)",
              textAlign: "center"
            }}
          >
            <p style={{ margin: 0, color: "#334e68", fontWeight: 600 }}>Junctions</p>
            <p style={{ margin: "10px 0 0", fontSize: "2rem", fontWeight: 700 }}>{junctions.length}</p>
          </div>

          <div
            style={{
              background: "linear-gradient(135deg, #ffffff, #eff6ff)",
              padding: "18px",
              borderRadius: "14px",
              boxShadow: "0 10px 30px rgba(16, 40, 67, 0.08)",
              textAlign: "center"
            }}
          >
            <p style={{ margin: 0, color: "#334e68", fontWeight: 600 }}>Parking Spots</p>
            <p style={{ margin: "10px 0 0", fontSize: "2rem", fontWeight: 700 }}>{parking.length}</p>
          </div>

          <div
            style={{
              background: "linear-gradient(135deg, #ffffff, #eff6ff)",
              padding: "18px",
              borderRadius: "14px",
              boxShadow: "0 10px 30px rgba(16, 40, 67, 0.08)",
              textAlign: "center"
            }}
          >
            <p style={{ margin: 0, color: "#334e68", fontWeight: 600 }}>Congested</p>
            <p style={{ margin: "10px 0 0", fontSize: "2rem", fontWeight: 700 }}>{congestedTrafficCount}</p>
          </div>
        </div>
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
          gap: "20px",
          marginBottom: "24px"
        }}
      >
        <div
          style={{
            background: "linear-gradient(180deg, #ffffff, #f5f8ff)",
            padding: "24px",
            borderRadius: "18px",
            boxShadow: "0 20px 40px rgba(16, 40, 67, 0.08)"
          }}
        >
          <h2 style={{ margin: 0, marginBottom: "16px", color: "#102a43" }}>Route Planner</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "8px", fontWeight: 600, color: "#334e68" }}>
              Source Junction
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: "14px",
                  border: "1px solid #cbd5e1",
                  fontSize: "15px",
                  fontWeight: 600,
                  background: "#f8fafc"
                }}
              >
                <option value="">Select Source Junction</option>
                {junctions.map((junction) => (
                  <option key={junction[0]} value={junction[1]}>
                    {junction[1]}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: "8px", fontWeight: 600, color: "#334e68" }}>
              Destination Junction
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: "14px",
                  border: "1px solid #cbd5e1",
                  fontSize: "15px",
                  fontWeight: 600,
                  background: "#f8fafc"
                }}
              >
                <option value="">Select Destination Junction</option>
                {junctions.map((junction) => (
                  <option key={junction[0]} value={junction[1]}>
                    {junction[1]}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={findRoute}
              style={{
                width: "100%",
                background: "linear-gradient(135deg,#1976d2,#42a5f5)",
                color: "white",
                border: "none",
                padding: "16px",
                borderRadius: "14px",
                fontSize: "16px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 16px 32px rgba(25, 118, 210, 0.24)"
              }}
            >
              🚀 Find Best Route
            </button>
          </div>
        </div>

        <div
          style={{
            background: "linear-gradient(180deg, #ffffff, #f0f9ff)",
            padding: "24px",
            borderRadius: "18px",
            boxShadow: "0 20px 40px rgba(16, 40, 67, 0.06)"
          }}
        >
          <h2 style={{ margin: 0, marginBottom: "16px", color: "#102a43" }}>Traffic Analytics</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
              gap: "16px"
            }}
          >
            <div
              style={{
                background: "#ffffff",
                padding: "18px",
                borderRadius: "14px",
                boxShadow: "0 10px 30px rgba(16, 40, 67, 0.06)"
              }}
            >
              <p style={{ margin: 0, color: "#334e68", fontWeight: 600 }}>Normal Traffic</p>
              <p style={{ margin: "12px 0 0", fontSize: "1.8rem", fontWeight: 700 }}>{normalTrafficCount}</p>
            </div>
            <div
              style={{
                background: "#ffffff",
                padding: "18px",
                borderRadius: "14px",
                boxShadow: "0 10px 30px rgba(16, 40, 67, 0.06)"
              }}
            >
              <p style={{ margin: 0, color: "#334e68", fontWeight: 600 }}>Moderate Traffic</p>
              <p style={{ margin: "12px 0 0", fontSize: "1.8rem", fontWeight: 700 }}>{moderateTrafficCount}</p>
            </div>
            <div
              style={{
                background: "#ffffff",
                padding: "18px",
                borderRadius: "14px",
                boxShadow: "0 10px 30px rgba(16, 40, 67, 0.06)"
              }}
            >
              <p style={{ margin: 0, color: "#334e68", fontWeight: 600 }}>Congested Traffic</p>
              <p style={{ margin: "12px 0 0", fontSize: "1.8rem", fontWeight: 700 }}>{congestedTrafficCount}</p>
            </div>
          </div>
        </div>
      </section>

      <div
        style={{
          marginBottom: "24px",
          padding: "20px 24px",
          background: "linear-gradient(135deg,#ffffff,#f5f7fa)",
          borderRadius: "18px",
          boxShadow: "0 20px 40px rgba(16, 40, 67, 0.06)",
          fontWeight: 600,
          fontSize: "1rem",
          color: "#102a43"
        }}
      >
        {routeInfo || "Select a source and destination to display the best route on the map."}
      </div>

      <MapContainer
        center={initialCenter}
        zoom={11}
        style={{ height: "700px", width: "100%", borderRadius: "18px", overflow: "hidden" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={position}>
          <Popup>📍 Your Current Location</Popup>
        </Marker>

        {parking.map((parkingSpot, index) => (
          <Marker
            key={index}
            icon={parkingIcon}
            position={[Number(parkingSpot[2]), Number(parkingSpot[3])]}
          >
            <Popup>
              <h3 style={{ margin: 0 }}>{parkingSpot[1]}</h3>
              <p style={{ margin: "8px 0 0" }}>Available Slots: {parkingSpot[4]}</p>
            </Popup>
          </Marker>
        ))}

        {junctions.map((junction, index) => (
          <CircleMarker
            key={index}
            center={[Number(junction[2]), Number(junction[3])]}
            radius={10}
            pathOptions={{
              color: getTrafficColor(junction[1]),
              fillColor: getTrafficColor(junction[1]),
              fillOpacity: 0.8
            }}
          >
            <Popup>{junction[1]}</Popup>
            <Tooltip permanent direction="top">
              🚦 {junction[1]}
            </Tooltip>
          </CircleMarker>
        ))}

        {sourceCoords && destinationCoords && (
          <RoutingMachine source={sourceCoords} destination={destinationCoords} />
        )}
      </MapContainer>
    </div>
  );
}

export default SmartMap;
