const Html5WebSocket = require("html5-websocket");
const ReconnectingWebSocket = require("reconnecting-websocket");
const { exec } = require("child_process");
const os = require("os");

// WebSocket initialization
let ws_host = "localhost"; // Replace with your EC2 IP or hostname
let ws_port = "3000";

// Ensure that the valid WebSocket class is passed into the options
const options = { WebSocket: Html5WebSocket };

const rws = new ReconnectingWebSocket(
  "ws://" + ws_host + ":" + ws_port + "/ws",
  // "ws://websocket.merakilearn.org/ws",
  undefined,
  options
);

rws.timeout = 1000; // Timeout duration

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

// Function to install software
function installSoftware(packageName) {
  console.log(`[Client] Installing software: ${packageName}`);
  exec(`sudo apt install -y ${packageName}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`[Client] Installation error: ${error.message}`);
      rws.send(`[Client] Installation error: ${error.message}`);
      return;
    }

    // Ignore "apt does not have a stable CLI" warning
    const aptWarning =
      "WARNING: apt does not have a stable CLI interface. Use with caution in scripts.";
    if (stderr && !stderr.includes(aptWarning)) {
      console.error(`[Client] Installation stderr: ${stderr}`);
      rws.send(`[Client] Installation error: ${stderr}`);
      return;
    }

    console.log(`[Client] Installation stdout: ${stdout}`);

    // Get MAC address
    const macAddress = getMacAddress();

    // Send success message to the server including MAC address and installed status
    rws.send(
      `[Client] ${macAddress}: Software installed successfully: ${packageName}`
    );
  });
}

// WebSocket event listeners
rws.addEventListener("open", () => {
  console.log("[Client] Connected to WebSocket server.");
});

rws.addEventListener("message", (e) => {
  const command = e.data.trim();
  console.log(`[Client] Command received from server: ${command}`);

  // Check if the command is for installing software
  if (command.startsWith("install")) {
    const packageName = "openbox"; // Extract package name (dynamic extraction can be implemented)

    console.log("[Client] Package name: " + packageName);
    if (packageName) {
      installSoftware(packageName);
    } else {
      rws.send("[Client] Error: No package name specified for installation.");
    }
  } else {
    // Handle other commands (non-installation commands)
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`[Client] Error executing command: ${error.message}`);
        rws.send(`[Client] Error: ${error.message}`);
        return;
      }

      if (stderr) {
        console.error(`[Client] Command executed with errors: ${stderr}`);
        rws.send(`[Client] Error: ${stderr}`);
        return;
      }

      console.log(`[Client] Sending command output to server: ${stdout}`);
      // Send the command output back to the server
      rws.send(stdout);
    });
  }
});

rws.addEventListener("close", () => {
  console.log("[Client] Connection closed.");
});

// Error handling
rws.onerror = (err) => {
  console.log("[Client] Error: " + err.message);
};
