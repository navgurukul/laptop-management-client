// const { exec } = require('child_process');
// const fs = require('fs');
// const path = require('path');

// const applicationName = 'Install Glances';
// const shortcutPath = path.join(process.env.HOME, 'Desktop', 'glances.desktop');
// const iconPath = '/usr/share/icons/hicolor/scalable/apps/utilities-system-monitor.svg'; // Example icon path, adjust as needed

// function installSoftware(packageName, callback) {
//     exec(`sudo apt install -y ${packageName}`, (error, stdout, stderr) => {
//         if (error) {
//             console.error(`exec error: ${error}`);
//             return;
//         }
//         console.log(`stdout: ${stdout}`);
//         console.error(`stderr: ${stderr}`);
//         if (callback) callback();
//     });
// }

// function createShortcut() {
//     const shortcutContent = `[Desktop Entry]
// Name=Glances
// Comment=Real-time system monitoring tool
// Exec=glances
// Icon=${iconPath}
// Terminal=true
// Type=Application
// Categories=System;`;

//     fs.writeFile(shortcutPath, shortcutContent, (err) => {
//         if (err) {
//             console.error('Error creating shortcut:', err);
//         } else {
//             console.log('Shortcut created at:', shortcutPath);
            
//             // Make the shortcut executable
//             fs.chmod(shortcutPath, '755', (err) => {
//                 if (err) {
//                     console.error('Error setting permissions:', err);
//                 } else {
//                     console.log('Shortcut is now executable.');
//                 }
//             });
//         }
//     });
// }

// function main() {
//     const packageName = 'glances';

//     console.log(`Running ${applicationName}...`);
//     installSoftware(packageName, createShortcut);
//     console.log(`${applicationName} completed.`);
// }

// main();

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const applicationName = process.env.APP_NAME || 'Install Glances';
const shortcutPath = path.join(process.env.HOME, 'Desktop', `${process.env.SHORTCUT_NAME || 'glances'}.desktop`);
const iconPath = process.env.ICON_PATH || '/usr/share/icons/hicolor/scalable/apps/utilities-system-monitor.svg'; 

function installSoftware(packageName, callback) {
    const packageToInstall = packageName || process.env.PACKAGE_NAME || 'glances'; 
    exec(`sudo apt install -y ${packageToInstall}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
        if (callback) callback();
    });
}

function createShortcut() {
    const appName = process.env.APP_DISPLAY_NAME || 'Glances';
    const appComment = process.env.APP_COMMENT || 'Real-time system monitoring tool';
    const appExec = process.env.APP_EXEC || 'glances';

    const shortcutContent = `[Desktop Entry]
Name=${appName}
Comment=${appComment}
Exec=${appExec}
Icon=${iconPath}
Terminal=true
Type=Application
Categories=System;`;

    fs.writeFile(shortcutPath, shortcutContent, (err) => {
        if (err) {
            console.error('Error creating shortcut:', err);
        } else {
            console.log('Shortcut created at:', shortcutPath);
            

            fs.chmod(shortcutPath, '755', (err) => {
                if (err) {
                    console.error('Error setting permissions:', err);
                } else {
                    console.log('Shortcut is now executable.');
                }
            });
        }
    });
}

function main() {
    const packageName = process.env.PACKAGE_NAME || 'glances'; 

    console.log(`Running ${applicationName}...`);
    installSoftware(packageName, createShortcut);
    console.log(`${applicationName} completed.`);
}

main();
