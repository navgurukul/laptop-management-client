const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", (ws) => {
  console.log("Client connected");

  const commands = [
    "ls", // List files in the current directory
    "pwd", // Print working directory
    "whoami", // Show current user
  ];

  // Log the commands being sent to the client
  console.log("Sending commands to client:", commands);

  // Send the commands to the client as JSON
  ws.send(JSON.stringify({ commands }));

  ws.on("message", (message) => {
    // Parse the incoming message as JSON
    let response;
    try {
      response = JSON.parse(message);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return;
    }

    if (response.success) {
      console.log("Commands successfully executed on client.");
      console.log("MAC Address:", response.mac);
      console.log("Output:", response.output);
    } else {
      console.log("Error in executing commands on the client.");
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

console.log("WebSocket server is running on ws://localhost:8080");
