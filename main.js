// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron');
const path = require('path');
// const os = require('os');

const remote = require('electron');

console.log(remote.nativeTheme.themeSource);
remote.nativeTheme.themeSource = 'dark';
remote.nativeTheme.shouldUseDarkColors = true;

// app.commandLine.appendArgument('--enable-experimental-web-platform-features');

app.commandLine.appendSwitch('js-flags', '--max-old-space-size=4096');

// const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer');
// installExtension(REACT_DEVELOPER_TOOLS)
//     .then((name) => console.log(`Added Extension:  ${name}`))
//     .catch((err) => console.log('An error occurred: ', err));


// import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
//
// installExtension(REACT_DEVELOPER_TOOLS)
//     .then((name) => console.log(`Added Extension:  ${name}`))
//     .catch((err) => console.log('An error occurred: ', err));

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        minWidth: 800,
        minHeight: 600,
        autoHideMenuBar: true,
        // frame: false,
        webPreferences: {
            nodeIntegration: true,

            // experimentalFeatures: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.webContents.openDevTools({
        mode: "detach"
    });

    // and load the index.html of the app.
    mainWindow.loadFile('index.html');

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    });


}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) createWindow();
});


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
