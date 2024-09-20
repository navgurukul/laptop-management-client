const { exec } = require('child_process');

// Command to change the wallpaper
const command = "gsettings set org.gnome.desktop.background picture-uri-dark https://images.pexels.com/photos/28292149/pexels-photo-28292149/free-photo-of-a-black-and-white-photo-of-many-boats-in-the-water.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";

// Execute the command
exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error: ${error.message}`);
        return
    }
    if (stderr) {
        console.error(`Stderr: ${stderr}`);
        return;
    }
    console.log(`Wallpaper changed successfully: ${stdout}`);
});