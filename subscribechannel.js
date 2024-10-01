// const WebSocket = require("ws");
// const readline = require("readline");
// const fs = require("fs");
// const path = require("path");


// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });


// const filePath = path.join(__dirname, 'channel.js');

// function updateScriptFile(newChannels) {
//   try {
//     const oldContent = fs.readFileSync(filePath, 'utf8');

    
//     const newContent = oldContent.replace(/(const channelsToSubscribe = \[).*(\];)/, `$1"${newChannels.join('", "')}"$2`);

    
//     fs.writeFileSync(filePath, newContent);

//     console.log(`Script updated with new channels: ${newChannels.join(', ')}`);
//   } catch (err) {
//     console.error("Error updating the script file:", err);
//   }
// }

// rl.question("Please enter the channels to subscribe to (e.g., channel1, channel2, channel3): ", (input) => {
//   const channelsToSubscribe = input.split(',').map(channel => channel.trim()); 
//   console.log(`You entered: ${channelsToSubscribe.join(', ')}`);

  
//   updateScriptFile(channelsToSubscribe);

//   // const channelsToSubscribe =["channel2", "channel3"];
// console.log(channelsToSubscribe)
  
//   const ws = new WebSocket("ws://localhost:8080");

//   ws.on("open", () => {
//     console.log("Connected to server");
//     console.log(`Subscribing to channels: ${channelsToSubscribe.join(', ')}`);

    
//     const message = JSON.stringify({ type: "subscribe", channels: channelsToSubscribe });
//     console.log("Sending message to server:", message);
//     ws.send(message);
//   });

//   ws.on("message", (message) => {
//     console.log(`Received: ${message}`);
//   });

//   ws.on("close", () => {
//     console.log("Disconnected from server");
//   });

  
//   rl.close();
// });


const WebSocket = require("ws");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Please enter the channels to subscribe to (e.g., channel1, channel2, channel3): ", (input) => {
  const channelsToSubscribe = input.split(',').map(channel => channel.trim());
  console.log(`You entered: ${channelsToSubscribe.join(', ')}`);

  // Create a WebSocket connection
  const ws = new WebSocket("ws://localhost:8080");

  ws.on("open", () => {
    console.log("Connected to server");
    console.log(`Subscribing to channels: ${channelsToSubscribe.join(', ')}`);

    // Send subscription message to the server
    const message = JSON.stringify({ type: "subscribe", channels: channelsToSubscribe });
    console.log("Sending message to server:", message);
    ws.send(message);
  });

  ws.on("message", (message) => {
    console.log(`Received: ${message}`);
  });

  ws.on("close", () => {
    console.log("Disconnected from server");
  });

  rl.close();
});
