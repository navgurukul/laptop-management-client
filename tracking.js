const fs = require("fs");
const os = require("os");
const sqlite3 = require("sqlite3").verbose(); 
const path = require("path");
const shell = require("shelljs"); 

const dbPath = path.join(__dirname, "system_status.db");
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS system_status (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unique_id TEXT,
      status TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

function getUniqueId() {
  const networkInterfaces = os.networkInterfaces();
  for (const interface in networkInterfaces) {
    for (const address of networkInterfaces[interface]) {

      if (address.family === "IPv4" && !address.internal) {
        return address.mac; 
      }
    }
  }
  return "UNKNOWN_ID"; 
}


function isOnline() {
  const networkInterfaces = os.networkInterfaces();
  let hasValidInterface = false;

  for (const interface in networkInterfaces) {
    for (const address of networkInterfaces[interface]) {
      if (address.family === "IPv4" && !address.internal) {
        hasValidInterface = true; 
        break;
      }
    }
  }

  return hasValidInterface; 
}


function logStatus() {
  const onlineStatus = isOnline();
  const uniqueId = getUniqueId(); 
  const timestamp = new Date().toISOString();
  const status = onlineStatus ? "ONLINE" : "OFFLINE";

  
  db.run(
    `INSERT INTO system_status (unique_id, status, timestamp) VALUES (?, ?, ?)`,
    [uniqueId, status, timestamp],
    (err) => {
      if (err) {
        console.error("Error inserting into database:", err);
      } else {
        console.log(
          `Status logged: ${timestamp} - "${uniqueId}" System is ${status}`
        );
      }
    }
  );
}

logStatus();


setInterval(logStatus, 60000); 
