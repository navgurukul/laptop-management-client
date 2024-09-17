const fs = require('fs');
const axios = require('axios');
const path = require('path');
const dbPath = path.join(__dirname, 'system_tracking.db');

// Function to upload the database file to the server
async function syncDatabase() {
  const isOnline = require('os').networkInterfaces();
  
  if (!isOnline) {
    console.log('No active internet connection. Syncing skipped.');
    return;
  }

  try {
    const fileStream = fs.createReadStream(dbPath);

    const response = await axios.post('http://websocket.merakilearn.org/databse-sync', fileStream, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename=${path.basename(dbPath)}`,
      },
    });

    console.log('Database sync successful:', response.data);
  } catch (error) {
    console.error('Error syncing database:', error.message);
  }
}

// Example call to sync database every 5 minutes
setInterval(syncDatabase, 300000); // 5 minutes in milliseconds
