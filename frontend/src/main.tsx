import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AppProvider } from "./context/AppContext.tsx";
import "leaflet/dist/leaflet.css";
import { SocketProvider } from "./context/SocketContext.tsx";
import { ThemeProvider } from "./context/ThemeProvider.tsx";

export const authService = "http://127.0.0.1:5000";
export const restaurantService = "http://127.0.0.1:5001";
export const utilsService = "http://127.0.0.1:5002";
export const realtimeService = "http://127.0.0.1:5004";
export const riderService = "http://127.0.0.1:5005";
export const adminService = "http://127.0.0.1:5006";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="cravo-theme">
      <GoogleOAuthProvider clientId="894582333536-usp122ti5u7afv89du3m876c9mffma8u.apps.googleusercontent.com">
        <AppProvider>
          <SocketProvider>
            <App />
          </SocketProvider>
        </AppProvider>
      </GoogleOAuthProvider>
    </ThemeProvider>
  </StrictMode>
);
