# Rapid Crisis Response (CrisisLink) 🚨

CrisisLink is a scalable, real-time enterprise emergency coordination platform designed for hospitality and large-scale facility management. Built with Next.js and Firebase, it provides a unified command center for managing critical incidents, coordinating staff responses, and tracking emergency geolocation in real-time.

## 🌟 Key Features & Functionalities

### 1. Role-Based Access Control (RBAC) & Security
*   **Dual-Tier Authentication:** Secure Firebase Auth implementation separating users into **Commanders** (Dispatch/Management) and **Staff** (On-the-ground responders).
*   **Database-Driven Role Persistence:** User roles are securely mapped and stored in the Firebase Realtime Database.
*   **Route Protection:** Custom Next.js middleware-style `AuthGuard` automatically intercepts unauthorized access attempts, redirecting users to their designated role-specific dashboards.

### 2. Live Commander Dashboard
*   **Centralized Overview:** A premium, dark-mode inspired command center displaying live incident feeds, deployed staff metrics, and active emergency alerts.
*   **Intelligent Dispatching:** Commanders can review incident details (e.g., Fire, Medical) and assign available, nearby staff members to respond with a single click.
*   **AI Crisis Assistant:** Integration with Google's **Gemini AI** provides real-time, context-aware instructions for handling specific emergencies (e.g., "How to handle a grease fire in the kitchen") directly within the dashboard.

### 3. Interactive Geolocation & Live Mapping
*   **Dynamic Tracking:** Utilizes the HTML5 `navigator.geolocation` API to stream live GPS coordinates from Staff mobile devices directly to the Commander's map.
*   **Leaflet Integration:** A highly interactive map (built with `react-leaflet`) that dynamically plots active incidents, staff locations, and emergency resources (like AEDs and Fire Extinguishers).
*   **Precision SOS Pinpointing:** When a guest triggers an SOS, the system captures both their manual room input and their exact GPS coordinates for precise responder routing.

### 4. Real-Time Data Synchronization
*   **Firebase Realtime Database:** The entire platform operates on WebSocket-like live data streams. When a guest submits an SOS, or a Commander assigns a task, the UI updates instantly across all connected devices without requiring page refreshes.

### 5. Web Notifications & Audio Alerts
*   **Background Alerting:** Custom React hooks utilizing the native Browser Notification API push desktop notifications to Commanders and Staff when a new critical incident occurs.
*   **Dynamic Audio Synthesis:** Uses the Web Audio API to generate high-pitched emergency "ping" sounds programmatically, ensuring responders are alerted even if the dashboard is running in a background tab.

### 6. Guest SOS Portal
*   **Frictionless Emergency Reporting:** A mobile-optimized, highly accessible SOS interface designed for panicked users. 
*   **One-Tap Alerts:** Guests can select emergency types (Medical, Fire, Security) and submit an alert instantly, triggering the entire response chain.

---

## 💻 Technology Stack

*   **Frontend Framework:** Next.js 14 (App Router)
*   **UI/Styling:** React, Tailwind CSS, Lucide Icons
*   **Map Rendering:** Leaflet, React-Leaflet
*   **Backend & Database:** Firebase Realtime Database
*   **Authentication:** Firebase Auth
*   **Artificial Intelligence:** Google Gemini AI API (Server Actions)
*   **Hosting & Deployment:** Vercel (Frontend), Firebase (Backend/Auth rules)

---

## 🎨 UI/UX Design Aesthetics
The application is designed to feel like a high-end, mission-critical enterprise software system:
*   **Commander View:** Employs a tactical "Dark Mode" aesthetic (Slate/Navy with bright warning accents) to reduce eye strain and highlight critical alerts.
*   **Staff View:** Clean, highly legible, mobile-first design optimized for rapid reading while moving.
*   **Micro-interactions:** Uses subtle CSS animations (like pulsing alert rings and slide-in modals) to draw attention to high-priority information without being overwhelming.

---

## 🚀 How to Run Locally

1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Create a `.env.local` file and add your Firebase and Gemini API keys.
4. Run `npm run dev` to start the development server on `localhost:3000`.
