const fs = require("fs");
const os = require("os");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const axios = require("axios");
const dbPath = path.join(__dirname, "system_tracking.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to the database.");
  }
});
//
db.serialize(() => {
  db.run(`DROP TABLE IF EXISTS system_tracking`);
  db.run(`
    CREATE TABLE system_tracking(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mac_address varchar(17) NOT NULL,
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
function isOnline() {
  const networkInterfaces = os.networkInterfaces();
  let hasValidInterface = false;
  for (const iface in networkInterfaces) {
    for (const address of networkInterfaces[iface]) {
      if (address.family === "IPv4" && !address.internal) {
        hasValidInterface = true;
        break;
      }
    }
  }
  return hasValidInterface;
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
    `SELECT * FROM system_tracking WHERE mac_address = ?`,
    [uniqueId],
    (err, row) => {
      if (err) {
        console.error("Error selecting from database:", err);
      } else if (row) {
        const minutes = row.minutes_online + 1;
        db.run(
          `UPDATE system_tracking SET status = ?, minutes_online = ?, location = ? WHERE mac_address = ?`,
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
          `INSERT INTO system_tracking (mac_address, status, timestamp, minutes_online, location) VALUES (?, ?, ?, ?, ?)`,
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
logStatus();
setInterval(logStatus, 60000);
process.on('SIGINT', () => {
  const uniqueId = getUniqueId();
  const timestamp = new Date().toISOString();
  db.run(
    `UPDATE system_tracking SET status = ?, minutes_online = ? WHERE mac_address = ?`,
    ["OFFLINE", null, uniqueId],
    (err) => {
      if (err) {
        console.error("Error updating database on exit:", err);
      } else {
        console.log(`Status updated: ${timestamp} - "${uniqueId}" System is `);
      }
      db.close(); // Close the database connection
      process.exit();
    }
  );
});