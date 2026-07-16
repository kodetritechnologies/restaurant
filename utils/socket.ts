import { io } from "socket.io-client";

// Connect to the separate Socket.IO server on port 3001
const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || (typeof window !== "undefined"
  ? `${window.location.protocol}//${window.location.hostname}:3001`
  : "http://localhost:3001");

const socket = io(socketUrl);

export default socket;
