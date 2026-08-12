# Cravo Food Delivery - Frontend UI

This is the React frontend for the Cravo Food Delivery platform. It provides interfaces for Customers, Restaurant Owners, Delivery Riders, and System Admins.

## Tech Stack
- **Framework**: React 18 with Vite
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Animations**: Framer Motion
- **State & Context**: React Context API
- **Routing**: React Router DOM v6
- **Real-time**: Socket.IO Client
- **Maps**: Leaflet & OpenStreetMap (Nominatim API)

## Getting Started

1. Ensure all backend microservices are running (Auth, Restaurant, Realtime, Rider, Utils, Admin).
2. Create a `.env` file based on `.env.example` in this directory.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:5173` in your browser.

## Features & Views

- **Customer Portal**: Browse nearby restaurants, search dishes, manage cart, track live orders on the map, view order history.
- **Restaurant Dashboard**: Accept/update orders, manage menu items, toggle restaurant online status.
- **Rider App**: Toggle availability, receive incoming order pings, accept delivery, complete pickup & dropoff.
- **Admin Panel**: Verify and approve new restaurant and rider registrations.

## Geolocation Note
The app requests location access on load. If denied, it defaults to a central location (New Delhi, India) for demonstration purposes. This is required to sort nearby restaurants using the MongoDB `$geoNear` aggregation.
