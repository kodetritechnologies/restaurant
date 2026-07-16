const { createServer } = require("node:http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  // Create a single HTTP server handling both Next.js and Socket.IO
  const httpServer = createServer(handler);

  // Attach Socket.IO to the same server
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    socket.on("call_waiter", (data) => {
      io.emit("waiter_called", data);
    });
  });

  // Render uses process.env.PORT, fallback to 3000 locally
  const currentPort = process.env.PORT || port;

  httpServer.listen(currentPort, () => {
    console.log(`> Ready on http://${hostname}:${currentPort}`);
  });
});
