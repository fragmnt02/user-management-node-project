import "./config/env";
import { createServer } from "http";
import app from "./app";
import { WebSocketService } from "./services/websocket.service";

const HOST: string = process.argv[2] || process.env.HOST || "localhost";
const PORT: number = Number(process.argv[3] || process.env.PORT || 8080);

const server = createServer(app);

// Initialize WebSocket service
new WebSocketService(server);

server.listen(PORT, HOST, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://${HOST}:${PORT}`);
  console.log(`WebSocket server ready for real-time updates`);
});
