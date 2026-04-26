export type Severity = "Critical" | "High" | "Medium" | "Resolved";
export type IncidentType = "Medical Emergency" | "Fire / Smoke" | "Security Threat" | "Other";
export type IncidentStatus = "new" | "claimed" | "responding" | "on_scene" | "resolved";

export interface Incident {
  id: string;
  type: IncidentType;
  roomNumber: string;
  floor: string;
  guestDescription?: string;
  severity: Severity;
  status: IncidentStatus;
  assignedTo?: string | null;
  createdAt: number;
  updatedAt: number;
  resolvedAt?: number;
  timeline?: { action: string; timestamp: number }[];
  location?: { lat: number; lng: number }; // For map
}

export interface Staff {
  id: string;
  name: string;
  role: "Staff" | "Commander";
  status: "Available" | "On Task" | "Off Duty";
  currentIncident?: string | null;
  floor?: string;
  fcmToken?: string;
  location?: { lat: number; lng: number }; // For map
}

export interface Resource {
  id: string;
  type: "First Aid Kit" | "AED" | "Fire Extinguisher" | "Evacuation Route";
  location: string;
  floor: string;
  status: "Available" | "In Use" | "Blocked" | "Clear";
  mapLocation?: { lat: number; lng: number };
}
