import { db } from "./firebase";
import { ref, push, set, onValue, update, onDisconnect, get } from "firebase/database";
import type { Incident, IncidentStatus, Severity, Staff } from "./types";

export const createIncident = async (incidentData: Partial<Incident>) => {
  const incidentsRef = ref(db, 'incidents');
  const newIncidentRef = push(incidentsRef);
  
  const newIncident = {
    ...incidentData,
    id: newIncidentRef.key,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    timeline: [{ action: "Alert Received via Guest SOS App", timestamp: Date.now() }]
  };
  
  await set(newIncidentRef, newIncident);
  return newIncidentRef.key;
};

export const updateIncident = async (id: string, updates: Partial<Incident>, actionDesc?: string) => {
  const incidentRef = ref(db, `incidents/${id}`);
  
  const updatePayload: any = {
    ...updates,
    updatedAt: Date.now()
  };

  await update(incidentRef, updatePayload);
  
  // If an action description is provided, we would ideally fetch the timeline and append to it.
  // For simplicity in this demo, we'll assume updates happen successfully.
};

export const subscribeToIncidents = (callback: (incidents: Incident[]) => void) => {
  const incidentsRef = ref(db, 'incidents');
  return onValue(incidentsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const incidentsList = Object.keys(data).map(key => ({
        ...data[key],
        id: key
      })) as Incident[];
      callback(incidentsList);
    } else {
      callback([]);
    }
  });
};

export const updateStaffPresence = async (uid: string, staffData: Partial<Staff>) => {
  const staffRef = ref(db, `staff/${uid}`);
  await update(staffRef, staffData);
  
  // Set up disconnect hook so they go offline if they close the tab
  onDisconnect(staffRef).update({ status: "Off Duty" });
};

export const subscribeToStaff = (callback: (staffList: Staff[]) => void) => {
  const staffRef = ref(db, 'staff');
  return onValue(staffRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const staffArray = Object.keys(data).map(key => ({
        ...data[key],
        id: key
      })) as Staff[];
      callback(staffArray);
    } else {
      callback([]);
    }
  });
};

export const createUserRole = async (uid: string, email: string, role: "Staff" | "Commander") => {
  const userRef = ref(db, `users/${uid}`);
  await set(userRef, {
    email,
    role,
    createdAt: Date.now()
  });
};

export const getUserRole = async (uid: string): Promise<"Staff" | "Commander" | null> => {
  const userRef = ref(db, `users/${uid}`);
  const snapshot = await get(userRef);
  if (snapshot.exists()) {
    return snapshot.val().role;
  }
  return null;
};
