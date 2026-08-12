import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAppData } from "./AppContext";
import { realtimeService } from "../main";

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

/**
 * Provides a Socket.IO connection to the component tree.
 *
 * Connects when the user is authenticated and disconnects on logout.
 * Uses useState (instead of useRef) so that consumers re-render
 * when the socket becomes available.
 */
export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { isAuth } = useAppData();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!isAuth) {
      // Disconnect and clear when logged out
      socket?.disconnect();
      setSocket(null);
      return;
    }

    // Avoid creating duplicate connections
    if (socket?.connected) return;

    const newSocket = io(realtimeService, {
      auth: {
        token: localStorage.getItem("token"),
      },
      transports: ["websocket"],
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Socket Connected", newSocket.id);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket Disconnected");
    });

    newSocket.on("connect_error", (err) => {
      console.log("Socket Error:", err.message);
    });

    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [isAuth]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
