export const client = new WebSocket("ws://localhost:8080");

client.onerror = () => console.log("Error al conectar con el servidor");
client.onopen = () => console.log("Conectado con el servidor");
client.onclose = () => console.log("Conexión cerrada");
