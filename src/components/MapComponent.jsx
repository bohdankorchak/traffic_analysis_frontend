import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import "@fortawesome/fontawesome-free/css/all.css";
import { Button, Loader, Header } from "semantic-ui-react";

const defaultIcon = L.divIcon({
  className: "custom-icon",
  html: `
    <div style="text-align: center; color: #798888;">
      <i class="map marker alternate icon" style="font-size: 30px;"></i>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Кастомні іконки для маркерів
const startIcon = L.divIcon({
  className: "custom-icon",
  html: `
    <div style="text-align: center; color: #798888;">
      <i class="map marker icon" style="font-size: 30px;"></i>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const endIcon = defaultIcon;

const BACKEND_URL = "http://localhost:8000";

const MapRouteBuilder = () => {
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [popupPosition, setPopupPosition] = useState(null);
  const [alternativeRoutes, setAlternativeRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [routeSegments, setRouteSegments] = useState([]);
  const routeColors = ["purple", "blue", "green"];


  const fetchRoutes = async (start, end) => {
    setLoading(true);

    try {
      const response = await axios.post(`${BACKEND_URL}/routes`, {
        origin: start,
        destination: end,
      });

      if (response.data.status === "success") {
        setAlternativeRoutes(response.data.routes || []);
      } else {
        console.error("Invalid response from backend:", response.data);
      }
    } catch (error) {
      console.error("Error fetching routes:", error);
    } finally {
      setLoading(false);
    }
  };

  const MapClickHandler = () => {
    useMapEvents({
      contextmenu(event) {
        const { lat, lng } = event.latlng;
        setPopupPosition([lat, lng]);
      },
    });
    return null;
  };


  const handleSetStartPoint = () => {
    setStartPoint(popupPosition);
    setPopupPosition(null);
    if (endPoint) fetchRoutes(popupPosition, endPoint);
  };

  const handleSetEndPoint = () => {
      const currentPopupPosition = popupPosition;
    setEndPoint(currentPopupPosition);
    setPopupPosition(null);
    if (startPoint) fetchRoutes(startPoint, currentPopupPosition);
  };

  const handleRebuildRoute = () => {
    handleSetEndPoint();
  };

  const resetStartPoint = () => {
    setStartPoint(null);
    setAlternativeRoutes([]);;
  };

  const resetEndPoint = () => {
    setEndPoint(null);
    setAlternativeRoutes([]);
  };

  const resetAll = () => {
    setStartPoint(null);
    setEndPoint(null);
    setAlternativeRoutes([]);
  };

  const getTrafficColor = (traffic) => {
    switch (traffic) {
      case "green":
        return "#4ADE80";
      case "yellow":
        return "#FFD93D";
      case "red":
        return "#FF6B6B";
        case "blue":
        return "#4D96FF";
        case "purple":
        return "#A78BFA";
      default:
        return "#4D96FF";
    }
  };

  const getSegmentColor = (segment, routeIndex) => {
    if (segment.color === "red" || segment.color === "yellow") {
      return getTrafficColor(segment.color);
    }
    return getTrafficColor(routeColors[routeIndex]) || getTrafficColor("blue");
  };

  return (
    <div style={{ position: "relative", height: "100vh" }}>
      <MapContainer center={[50.4501, 30.5234]} zoom={12} style={{ height: "100%" }}>
        <TileLayer
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <MapClickHandler />

        {popupPosition && (
          <Popup fluid
            position={popupPosition}
            closeButton={false}
            onClose={() => setPopupPosition(null)}
          >
            {!startPoint ? (
              <Button fluid onClick={handleSetStartPoint}>Start Point</Button>
            ) : !endPoint ? (
              <Button fluid onClick={handleSetEndPoint}>End Point</Button>
            ) : (
              <Button fluid onClick={handleRebuildRoute}>New Route</Button>
            )}
          </Popup>
        )}

        {startPoint && <Marker position={startPoint} icon={startIcon}>
          <Popup closeButton={false}>
              <Button onClick={resetStartPoint}>Reset Start Point</Button>
            </Popup>
        </Marker>}
        {endPoint && <Marker position={endPoint} icon={endIcon}>
          <Popup closeButton={false}>
              <Button onClick={resetEndPoint}>Reset End Point</Button>
            </Popup>
        </Marker>}

        {alternativeRoutes.slice().reverse().map((route, routeIndex) => (
          <React.Fragment key={routeIndex}>
            {route.segments.map((segment, segmentIndex) => (
              <Polyline
                key={segmentIndex}
                positions={segment.polyline.map(([lat, lng]) => [lat, lng])}
                pathOptions={{
                  color: getSegmentColor(segment, routeIndex),
                  weight: 5,
                  opacity: 0.95,
                }}
              />))}

          {route.segments.map((segment, segmentIndex) => (
              <Polyline
                key={segmentIndex}
                positions={segment.polyline.map(([lat, lng]) => [lat, lng])}
                pathOptions={{
                  color: getSegmentColor(segment, routeIndex),
                  weight: 8,
                  opacity: 0.4,
               }}
              >
              <Popup closeButton={false}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                  <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", margin: 0}}>
                    <Header as='h4' style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "2px" }}>{route.duration}</Header>
                    <p style={{ fontSize: "14px", color: "#555" }}>{route.distance} </p>
                  </div>
                <Button onClick={resetAll}>Reset</Button>
                </div>
              </Popup>
            </Polyline>
              ))}
          </React.Fragment>
        ))}
      </MapContainer>

      {loading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <Loader active size="large" content="Loading routes..." />
        </div>
      )}
    </div>
  );
};

export default MapRouteBuilder;
