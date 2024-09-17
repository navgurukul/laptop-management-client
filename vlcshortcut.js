const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const desktopPath = path.join(process.env.HOME, 'Desktop');
const vlcShortcutPath = path.join(desktopPath, 'vlc.desktop');

const shortcutContent = `
[Desktop Entry]
Version=1.0
Name=VLC Media Player
Comment=Play your media files
Exec=/usr/bin/vlc
Icon=/usr/share/icons/hicolor/256x256/apps/vlc.png
Terminal=false
Type=Application
Categories=AudioVideo;Player;Recorder;
`;


fs.writeFile(vlcShortcutPath, shortcutContent, (err) => {
  if (err) {
    console.error('Error creating VLC shortcut:', err);
  } else {

    exec(`chmod +x "${vlcShortcutPath}"`, (chmodErr) => {
      if (chmodErr) {
        console.error('Error setting executable permission:', chmodErr);
      } else {
       
        exec(`gio set "${vlcShortcutPath}" metadata::trusted true`, (gioErr) => {
          if (gioErr) {
            console.error('Error marking as trusted:', gioErr);
          } else {
            console.log('VLC shortcut created and marked as executable successfully!');
          }
        });
      }
    });
  }
});
