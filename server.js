const { createServer } = require("node:http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const nextServer = createServer(handler);
  nextServer.listen(port, () => {
    console.log(`> Next.js ready on http://${hostname}:${port}`);
  });

  const socketServer = createServer();
  const io = new Server(socketServer, {
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

  socketServer.listen(3001, () => {
    console.log(`> Socket.IO ready on http://${hostname}:3001`);
  });
});
