import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";

function RoutingMachine({ source, destination, sourceName, destinationName }) {
  const map = useMap();
  const routingControlRef = useRef(null);
  const namesRef = useRef({ sourceName, destinationName });

  useEffect(() => {
    namesRef.current = { sourceName, destinationName };
  }, [sourceName, destinationName]);

  useEffect(() => {
    if (!map) return;

    const routingControl = L.Routing.control({
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1"
      }),
      waypoints: [],
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: false,
      show: false,
      createMarker: function (i, wp, nWps) {
        const { sourceName: src, destinationName: dest } = namesRef.current;
        const name = i === 0 ? src : dest;
        const isStart = i === 0;
        const color = isStart ? "#10b981" : "#ef4444";
        const iconHtml = `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            color: ${color};
            border: 2px solid ${color};
            border-radius: 50%;
            width: 32px;
            height: 32px;
            font-weight: bold;
            font-size: 14px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.15);
          ">
            ${isStart ? '🟢' : '🏁'}
          </div>
        `;
        return L.marker(wp.latLng, {
          draggable: false,
          icon: L.divIcon({
            html: iconHtml,
            className: "custom-routing-marker",
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          })
        })
        .bindPopup(name || (isStart ? "Source" : "Destination"))
        .bindTooltip(name || (isStart ? "Source" : "Destination"), {
          permanent: true,
          direction: "top",
          offset: [0, -16]
        });
      },
      lineOptions: {
        addWaypoints: false,
        styles: [
          { color: "#1976d2", weight: 6, opacity: 0.9 },
          { color: "#90caf9", weight: 3, opacity: 0.8 }
        ]
      }
    });

    // Safely override methods to prevent errors if the component unmounts while routing is in progress
    const originalClearLines = routingControl._clearLines;
    routingControl._clearLines = function () {
      if (this._map) {
        originalClearLines.call(this);
      }
    };

    const originalClearAlts = routingControl._clearAlts;
    routingControl._clearAlts = function () {
      if (this._map) {
        originalClearAlts.call(this);
      }
    };

    const originalRouteSelected = routingControl._routeSelected;
    routingControl._routeSelected = function (e) {
      if (this._map) {
        originalRouteSelected.call(this, e);
      }
    };

    const originalSetAlternatives = routingControl.setAlternatives;
    routingControl.setAlternatives = function (routes) {
      if (this._map) {
        originalSetAlternatives.call(this, routes);
      }
      return this;
    };

    routingControl.addTo(map);

    const handleRoutesFound = function (e) {
      const route = e.routes[0];
      if (route && route.bounds) {
        map.fitBounds(route.bounds, {
          padding: [50, 50],
          maxZoom: 16,
          animate: true
        });
      }
    };

    routingControl.on("routesfound", handleRoutesFound);
    routingControlRef.current = routingControl;

    return () => {
      const control = routingControlRef.current;
      if (control) {
        control.off("routesfound", handleRoutesFound);
        if (control._pendingRequest && typeof control._pendingRequest.abort === "function") {
          try {
            control._pendingRequest.abort();
          } catch (e) {
            console.error("Error aborting routing request:", e);
          }
        }
        if (control._map) {
          map.removeControl(control);
        }
        routingControlRef.current = null;
      }
    };
  }, [map]);

  useEffect(() => {
    const routingControl = routingControlRef.current;
    if (!routingControl || !source || !destination) return;

    const sourceWaypoint = L.latLng(source[0], source[1]);
    const destinationWaypoint = L.latLng(destination[0], destination[1]);
    routingControl.setWaypoints([sourceWaypoint, destinationWaypoint]);
    routingControl.route();
  }, [source, destination]);

  return null;
}

export default RoutingMachine;
