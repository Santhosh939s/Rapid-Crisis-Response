"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import type { Incident, Staff } from "@/lib/types";

interface MapPanelProps {
  activeIncidents?: Incident[];
  staff?: Staff[];
  centerLocation?: { lat: number; lng: number };
}

// Map Updater Component to change center when active incident changes
function MapUpdater({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
}

export default function MapPanel({ activeIncidents = [], staff = [], centerLocation = { lat: 37.7749, lng: -122.4194 } }: MapPanelProps) {
  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={[centerLocation.lat, centerLocation.lng]} 
        zoom={16} 
        scrollWheelZoom={true} 
        className="w-full h-full z-0"
        style={{ height: "100%", minHeight: "400px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={centerLocation} />

        {/* Mock Incidents Marker */}
        {activeIncidents.map(inc => (
          <Marker 
            key={inc.id} 
            position={inc.location ? [inc.location.lat, inc.location.lng] : [centerLocation.lat + 0.001, centerLocation.lng - 0.001]}
          >
            <Popup>
              <strong>{inc.type}</strong><br/>
              Room: {inc.roomNumber} ({inc.floor})<br/>
              Status: {inc.status}
            </Popup>
          </Marker>
        ))}

        {/* Mock Staff Markers */}
        {staff.map(s => (
          <Marker 
            key={s.id} 
            position={s.location ? [s.location.lat, s.location.lng] : [centerLocation.lat - 0.001, centerLocation.lng + 0.001]}
          >
            <Popup>
              <strong>{s.name}</strong><br/>
              Role: {s.role}<br/>
              Status: {s.status}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
