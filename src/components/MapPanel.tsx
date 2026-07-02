"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import L from "leaflet";
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

// Custom Tactical Icons
const createIncidentIcon = (severity: string) => {
  const color = severity === "Critical" ? "#ef4444" : severity === "High" ? "#f97316" : "#eab308";
  return L.divIcon({
    className: "custom-div-icon",
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px ${color}; animation: pulse 2s infinite;"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const createStaffIcon = (status: string) => {
  const color = status === "Available" ? "#10b981" : status === "On Task" ? "#3b82f6" : "#64748b";
  return L.divIcon({
    className: "custom-div-icon",
    html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color};"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
};

export default function MapPanel({ activeIncidents = [], staff = [], centerLocation = { lat: 37.7749, lng: -122.4194 } }: MapPanelProps) {
  
  // Calculate Polylines connecting staff to their assigned incidents
  const polylines = useMemo(() => {
    const lines: { positions: [number, number][]; color: string }[] = [];
    
    staff.forEach(s => {
      if (s.status === "On Task" && s.currentIncident && s.location) {
        const incident = activeIncidents.find(i => i.id === s.currentIncident);
        if (incident && incident.location) {
          lines.push({
            positions: [
              [s.location.lat, s.location.lng],
              [incident.location.lat, incident.location.lng]
            ],
            color: "#3b82f6"
          });
        }
      }
    });
    
    return lines;
  }, [activeIncidents, staff]);

  return (
    <div className="w-full h-full relative z-0 bg-[#050B14]">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .leaflet-container {
          background: #050B14 !important;
        }
      `}} />
      <MapContainer 
        center={[centerLocation.lat, centerLocation.lng]} 
        zoom={16} 
        scrollWheelZoom={true} 
        className="w-full h-full z-0"
        style={{ height: "100%", minHeight: "400px" }}
      >
        {/* Dark Mode Map Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapUpdater center={centerLocation} />

        {/* Polylines for Staff -> Incident */}
        {polylines.map((line, idx) => (
          <Polyline 
            key={idx} 
            positions={line.positions} 
            color={line.color} 
            weight={3} 
            dashArray="10, 10" 
            className="animate-pulse"
          />
        ))}

        {/* Incidents Markers */}
        {activeIncidents.map(inc => (
          <Marker 
            key={inc.id} 
            position={inc.location ? [inc.location.lat, inc.location.lng] : [centerLocation.lat + 0.001, centerLocation.lng - 0.001]}
            icon={createIncidentIcon(inc.severity)}
          >
            <Popup>
              <div className="text-slate-800">
                <strong className="block text-red-600 mb-1">{inc.type}</strong>
                Room: {inc.roomNumber} ({inc.floor})<br/>
                Status: <span className="uppercase text-xs font-bold">{inc.status}</span>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Staff Markers */}
        {staff.map(s => (
          <Marker 
            key={s.id} 
            position={s.location ? [s.location.lat, s.location.lng] : [centerLocation.lat - 0.001, centerLocation.lng + 0.001]}
            icon={createStaffIcon(s.status)}
          >
            <Popup>
              <div className="text-slate-800">
                <strong className="block text-blue-600 mb-1">{s.name}</strong>
                Role: {s.role}<br/>
                Status: <span className="uppercase text-xs font-bold">{s.status}</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
