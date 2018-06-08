const { app, BrowserWindow } = require('electron')

let win;

function createWindow() {
    // Create the browser window 1280x920 without frame, with white background and using as icon Angular favico
    win = new BrowserWindow({
        width: 1280,
        // uncomment the line below to get rid of windows frame
        /*frame: false,*/
        height: 920,
        backgroundColor: '#ffffff',
        icon: `file://${__dirname}/dist/angular-truffle-dapp/favicon.ico`
    })

    //Load the entry index of the page
    win.loadURL(`file://${__dirname}/dist/angular-truffle-dapp/index.html`)

    // uncomment below to open the DevTools.
    //win.webContents.openDevTools()

    // comment below to make menu bar appear
    win.setMenu(null);

    // comment below to make app start as a fixed size window, not full screen
    win.maximize();

    // Event when the window is closed.
    win.on('closed', function () {
        win = null
    });
}

// Create window on electron intialization
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {

    // On macOS specific close process
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    // macOS specific close process
    if (win === null) {
        createWindow();
    }
});