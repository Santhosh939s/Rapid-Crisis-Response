import type { Incident, Staff } from "./types";

let mockIncidents: Incident[] = [
  {
    id: "mock-inc-1",
    type: "Fire / Smoke",
    roomNumber: "402",
    floor: "4th Floor",
    severity: "Critical",
    status: "new",
    assignedTo: null,
    createdAt: Date.now() - 120000,
    updatedAt: Date.now() - 120000,
    location: { lat: 37.7749, lng: -122.4194 },
    timeline: [{ action: "Alert Received via Guest SOS App", timestamp: Date.now() - 120000 }]
  }
];

let mockStaff: Staff[] = [
  {
    id: "mock-staff-1",
    name: "John Respondo",
    role: "Staff",
    status: "Available",
    currentIncident: null,
    floor: "Lobby",
    location: { lat: 37.7748, lng: -122.4195 }
  },
  {
    id: "mock-staff-2",
    name: "Sarah Medic",
    role: "Staff",
    status: "On Task",
    currentIncident: "mock-inc-2",
    floor: "2nd Floor",
    location: { lat: 37.7750, lng: -122.4192 }
  }
];

type Callback<T> = (data: T) => void;

let incidentListeners: Callback<Incident[]>[] = [];
let staffListeners: Callback<Staff[]>[] = [];

const notifyIncidents = () => incidentListeners.forEach(cb => cb([...mockIncidents]));
const notifyStaff = () => staffListeners.forEach(cb => cb([...mockStaff]));

export const mockCreateIncident = async (incidentData: Partial<Incident>) => {
  const newId = `mock-inc-${Date.now()}`;
  const newIncident = {
    ...incidentData,
    id: newId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    timeline: [{ action: "Alert Received via Guest SOS App", timestamp: Date.now() }]
  } as Incident;
  
  mockIncidents.push(newIncident);
  notifyIncidents();
  return newId;
};

export const mockUpdateIncident = async (id: string, updates: Partial<Incident>, actionDesc?: string) => {
  mockIncidents = mockIncidents.map(inc => {
    if (inc.id === id) {
      const updated = { ...inc, ...updates, updatedAt: Date.now() };
      if (actionDesc) {
        updated.timeline = [...(updated.timeline || []), { action: actionDesc, timestamp: Date.now() }];
      }
      return updated;
    }
    return inc;
  });
  notifyIncidents();
};

export const mockSubscribeToIncidents = (callback: (incidents: Incident[]) => void) => {
  incidentListeners.push(callback);
  callback([...mockIncidents]);
  return () => {
    incidentListeners = incidentListeners.filter(cb => cb !== callback);
  };
};

export const mockUpdateStaffPresence = async (uid: string, staffData: Partial<Staff>) => {
  mockStaff = mockStaff.map(s => s.id === uid ? { ...s, ...staffData } : s);
  notifyStaff();
};

export const mockSubscribeToStaff = (callback: (staffList: Staff[]) => void) => {
  staffListeners.push(callback);
  callback([...mockStaff]);
  return () => {
    staffListeners = staffListeners.filter(cb => cb !== callback);
  };
};

// Simulation Engine for Demo Mode
export const triggerSimulation = () => {
  // 1. New SOS comes in after 2 seconds
  setTimeout(() => {
    mockCreateIncident({
      type: "Medical Emergency",
      roomNumber: "215",
      floor: "2nd Floor",
      severity: "High",
      status: "new",
      assignedTo: null,
      location: { lat: 37.7751, lng: -122.4190 }
    });
  }, 2000);

  // 2. Staff is automatically assigned after 5 seconds
  setTimeout(() => {
    const newInc = mockIncidents.find(i => i.type === "Medical Emergency");
    if (newInc) {
      mockUpdateIncident(newInc.id, { status: "claimed", assignedTo: "John Respondo" }, "Commander assigned John Respondo");
      mockUpdateStaffPresence("mock-staff-1", { status: "On Task", currentIncident: newInc.id });
    }
  }, 6000);

  // 3. Staff moves towards location (mock GPS update)
  setTimeout(() => {
    mockUpdateStaffPresence("mock-staff-1", { location: { lat: 37.7750, lng: -122.4192 } });
  }, 9000);

  // 4. Incident resolved
  setTimeout(() => {
    const newInc = mockIncidents.find(i => i.type === "Medical Emergency");
    if (newInc) {
      mockUpdateIncident(newInc.id, { status: "resolved" }, "Incident resolved by John Respondo");
      mockUpdateStaffPresence("mock-staff-1", { status: "Available", currentIncident: null });
    }
  }, 14000);
};
