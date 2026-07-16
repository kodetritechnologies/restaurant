import { io } from "socket.io-client";

// By default, io() connects to the same host that serves the page.
// This works perfectly since Next.js and Socket.IO now share the same server.
const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || undefined;

const socket = io(socketUrl, {
  // Add path explicitly just in case
  path: "/socket.io/",
});

export default socket;
