// const Html5WebSocket = require("html5-websocket");
// const ReconnectingWebSocket = require("reconnecting-websocket");
// const { exec } = require("child_process");
// const os = require("os");

// // WebSocket initialization
// let ws_host = "localhost"; // Replace with your EC2 IP or hostname
// let ws_port = "3000";

// // Ensure that the valid WebSocket class is passed into the options
// const options = { WebSocket: Html5WebSocket };

// const rws = new ReconnectingWebSocket(
//   "ws://" + ws_host + ":" + ws_port + "/ws",
//   // "ws://websocket.merakilearn.org/ws",
//   undefined,
//   options
// );
// fetch("http://localhost:3000/movies").then((response) => {
//   response.json().then((data) => {
//     console.log(data);
//   });
// });

// rws.timeout = 1000; // Timeout duration

// // Function to get MAC address
// function getMacAddress() {
//   const networkInterfaces = os.networkInterfaces();
//   for (let interfaceName in networkInterfaces) {
//     const networkDetails = networkInterfaces[interfaceName];
//     for (let i = 0; i < networkDetails.length; i++) {
//       if (
//         networkDetails[i].mac &&
//         networkDetails[i].mac !== "00:00:00:00:00:00"
//       ) {
//         return networkDetails[i].mac;
//       }
//     }
//   }
//   return "Unknown MAC Address";
// }

// // Function to install software
// function installSoftware(packageName) {
//   console.log(`[Client] Installing software: ${packageName}`);
//   exec(`sudo apt install -y ${packageName}`, (error, stdout, stderr) => {
//     if (error) {
//       console.error(`[Client] Installation error: ${error.message}`);
//       rws.send(`[Client] Installation error: ${error.message}`);
//       return;
//     }

//     // Ignore "apt does not have a stable CLI" warning
//     const aptWarning =
//       "WARNING: apt does not have a stable CLI interface. Use with caution in scripts.";
//     if (stderr && !stderr.includes(aptWarning)) {
//       console.error(`[Client] Installation stderr: ${stderr}`);
//       rws.send(`[Client] Installation error: ${stderr}`);
//       return;
//     }

//     console.log(`[Client] Installation stdout: ${stdout}`);

//     // Get MAC address
//     const macAddress = getMacAddress();

//     // Send success message to the server including MAC address and installed status
//     rws.send(
//       `[Client] ${macAddress}: Software installed successfully: ${packageName}`
//     );
//   });
// }

// // WebSocket event listeners
// rws.addEventListener("open", () => {
//   console.log("[Client] Connected to WebSocket server.");
// });

// rws.addEventListener("message", (e) => {
//   const command = e.data.trim();
//   console.log(`[Client] Command received from server: ${command}`);

//   // Check if the command is for installing software
//   if (command.startsWith("install")) {
//     const packageName = "openbox"; // Extract package name (dynamic extraction can be implemented)

//     console.log("[Client] Package name: " + packageName);
//     if (packageName) {
//       installSoftware(packageName);
//     } else {
//       rws.send("[Client] Error: No package name specified for installation.");
//     }
//   } else {
//     // Handle other commands (non-installation commands)
//     exec(command, (error, stdout, stderr) => {
//       if (error) {
//         console.error(`[Client] Error executing command: ${error.message}`);
//         rws.send(`[Client] Error: ${error.message}`);
//         return;
//       }

//       if (stderr) {
//         console.error(`[Client] Command executed with errors: ${stderr}`);
//         rws.send(`[Client] Error: ${stderr}`);
//         return;
//       }

//       console.log(`[Client] Sending command output to server: ${stdout}`);
//       // Send the command output back to the server
//       rws.send(stdout);
//     });
//   }
// });



// rws.addEventListener("close", () => {
//   console.log("[Client] Connection closed.");
// });

// // Error handling
// rws.onerror = (err) => {
//   console.log("[Client] Error: " + err.message);
// };


const fs = require("fs");
const os = require("os");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const axios = require("axios");

const dbPath = path.join(__dirname, "system_status.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to the database.");
  }
});


db.serialize(() => {
  db.run(`DROP TABLE IF EXISTS system_status`);
  db.run(`
    CREATE TABLE system_status(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unique_id varchar(17) NOT NULL,
      status TEXT,
      timestamp TEXT,
      minutes_online INTEGER,
      location TEXT,
      created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
});

let lastKnownUniqueId = null;

function getUniqueId() {
  const networkInterfaces = os.networkInterfaces();
  for (const iface in networkInterfaces) {
    for (const address of networkInterfaces[iface]) {
      if (address.family === "IPv4" && !address.internal) {
        lastKnownUniqueId = address.mac;
        return address.mac;
      }
    }
  }
  return lastKnownUniqueId || "UNKNOWN_ID";
}

async function getLocation() {
  try {
    const response = await axios.get('http://ip-api.com/json/');
    const { city, regionName, country } = response.data;
    return `${city}, ${regionName}, ${country}`;
  } catch (error) {
    console.error("Error fetching location:", error.message);
    return "Unknown Location";
  }
}

async function logStatus() {
  const uniqueId = getUniqueId();
  const timestamp = new Date().toISOString();
  const status = "active";
  const location = await getLocation();

  db.get(
    `SELECT * FROM system_status WHERE unique_id = ?`,
    [uniqueId],
    (err, row) => {
      if (err) {
        console.error("Error selecting from database:", err);
      } else if (row) {
        const minutes = row.minutes_online + 1;
        db.run(
          `UPDATE system_status SET status = ?, minutes_online = ?, location = ? WHERE unique_id = ?`,
          [status, minutes, location, uniqueId],
          (err) => {
            if (err) {
              console.error("Error updating database:", err);
            } else {
              console.log(`Status updated: ${timestamp} - "${uniqueId}" System is ${status} for ${minutes} minutes at ${location}`);
            }
          }
        );
      } else {
        db.run(
          `INSERT INTO system_status (unique_id, status, timestamp, minutes_online, location) VALUES (?, ?, ?, ?, ?)`,
          [uniqueId, status, timestamp, 1, location],
          (err) => {
            if (err) {
              console.error("Error inserting into database:", err);
            } else {
              console.log(`Status logged: ${timestamp} - "${uniqueId}" System is ${status} for 1 minute at ${location}`);
            }
          }
        );
      }
    }
  );
}


async function trackSystemStatus() {
  await logStatus();
}
setInterval(trackSystemStatus, 60000);


module.exports = { trackSystemStatus };