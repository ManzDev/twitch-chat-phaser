import tmi from "tmi.js";
import { server as WebSocketServer } from "websocket";
import http from "http";

const CHANNEL = "ManzDev";
const client = new tmi.Client({ channels: [CHANNEL] });

// WEBSOCKET CLIENT

const WEBSOCKET_PORT = 8080;
let ws;

const server = http.createServer();
server.listen(WEBSOCKET_PORT, () => console.log((new Date()) + ` Server ready (${WEBSOCKET_PORT})`));
const wsServer = new WebSocketServer({ httpServer: server });

wsServer.on("request", (request) => {
  ws = request.accept(null, request.origin);
  console.log("WebSocket Server | New connection: ", request.key);
});

wsServer.on("close", (request) => console.log("WebSocket Server | Connection closed."));

// TWITCH CLIENT

client.connect();

client.on("message", (channel, tags, message, self) => {
  const nick = tags.username;
  const color = tags.color ?? "#ffffff";
  const isMod = tags.mod ?? false;
  const isSub = tags.subscriber ?? false;
  console.log(`${nick}: ${message} / ${color} / ${isMod} / ${isSub}`);

  const data = JSON.stringify({ nick, color, isMod, isSub, message });
  if (ws) {
    ws.send(data);
  }
});
