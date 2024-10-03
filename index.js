
const WebSocket = require("ws");
const { exec } = require("child_process");
const os = require("os");
const fs = require("fs");
const path = require("path");

// Path to the JSON file
const channelFilePath = path.join(__dirname, "channel.json");

// Function to read current channel from JSON file
function getCurrentChannel() {
  try {
    const data = fs.readFileSync(channelFilePath, "utf8");
    const parsedData = JSON.parse(data);
    return parsedData.currentChannel || []; // Return an empty array if no channels exist
  } catch (error) {
    console.error("Error reading channel data:", error);
    return [];
  }
}

let channelNames = getCurrentChannel(); // Expecting an array of channels
console.log(`Initial Channel Names loaded: ${channelNames.join(", ")}`);

// WebSocket initialization
let ws_host = "localhost"; // Replace with your EC2 IP or hostname
let ws_port = "8080";

// const rws = new WebSocket(`ws://${ws_host}:${ws_port}`);

const rws = new WebSocket("ws://websocket.merakilearn.org/ws");

rws.on("open", () => {
  console.log("[Client] Connected to WebSocket server.");

  // Prepare the subscription message
  const message = JSON.stringify({
    type: "subscribe",
    channels: channelNames,
  });

  console.log("Sending message to server:", message);
  rws.send(message); // Send subscription message on connection open
});

rws.on("message", async (data) => {
  // console.log(`[Client] Message received from server: ${data}`);
  const dataObj = JSON.parse(data);
  const commands = dataObj.commands;
  console.log(`[Client] Command received from server: ${typeof commands}`);
  const macAddress = getMacAddress(); // Get the MAC address
  // Directly execute the install command using executeCommand

  try {
    for (const command of commands) {
      await executeCommand(command);
    }

    console.log("All commands executed. Sending results to the server.");
    rws.send(
      JSON.stringify({
        success: true,
        mac: macAddress,
      })
    );
  } catch (error) {
    console.error("An error occurred while executing commands:", error);

    rws.send(
      JSON.stringify({
        success: false,
        mac: macAddress,
      })
    );
  }
});

rws.on("close", (event) => {
  console.log("[Client] Connection closed.");
  console.log(`Close code: ${event.code}, reason: ${event.reason}`);
});

rws.on("error", (error) => {
  console.error("[Client] Error: " + error.message);
});

// Function to get MAC address
function getMacAddress() {
  const networkInterfaces = os.networkInterfaces();
  for (let interfaceName in networkInterfaces) {
    const networkDetails = networkInterfaces[interfaceName];
    for (let i = 0; i < networkDetails.length; i++) {
      if (
        networkDetails[i].mac &&
        networkDetails[i].mac !== "00:00:00:00:00:00"
      ) {
        return networkDetails[i].mac;
      }
    }
  }
  return "Unknown MAC Address";
}

// // Function to execute a command
const executeCommand = (command) => {
  return new Promise((resolve, reject) => {
    const macAddress = getMacAddress(); // Get the MAC address

    console.log(`Executing command: ${command}`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command "${command}": ${error.message}`);
        // rws.send(
        //   `[MAC: ${macAddress}] Error executing command "${command}": ${error.message}\n`
        // );
        reject(error);
      } else {
        console.log(`Output of "${command}":\n${stdout}`);
        // rws.send(`[MAC: ${macAddress}] Output of "${command}": ${stdout}\n`);
        if (stderr) {
          console.warn(`Stderr of "${command}": ${stderr}`);
          // rws.send(`[MAC: ${macAddress}] Stderr of "${command}": ${stderr}\n`);
        }
        resolve();
      }
    });
  });
};