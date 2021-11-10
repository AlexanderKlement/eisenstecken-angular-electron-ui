import {app, BrowserWindow, dialog, screen, shell} from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as url from 'url';

// Initialize remote module
require('@electron/remote/main').initialize();

let win: BrowserWindow = null;
const gotTheLock = app.requestSingleInstanceLock();
const args = process.argv.slice(1),
    serve = args.some(val => val === '--serve');


function createWindow(): BrowserWindow {

    const electronScreen = screen;
    const size = electronScreen.getPrimaryDisplay().workArea;

    // Create the browser window.
    win = new BrowserWindow({
        x: size.x,
        y: size.y,
        width: size.width,
        height: size.height,
        icon: 'src/logo.ico',
        title: "Eisenstecken",
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: false,
            allowRunningInsecureContent: (serve) ? true : false,
            contextIsolation: true,  // false if you want to run e2e test with Spectron
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js')
        },
    });
    win.maximize();

    if (serve) {
        win.webContents.openDevTools();
        require('electron-reload')(__dirname, {
            electron: require(path.join(__dirname, '/../node_modules/electron'))
        });
        win.loadURL('http://localhost:4200');
    } else {
        // Path when running electron executable
        let pathIndex = './index.html';

        if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
            // Path when running electron in local folder
            pathIndex = '../dist/index.html';
        }

        win.loadURL(url.format({
            pathname: path.join(__dirname, pathIndex),
            protocol: 'file:',
            slashes: true
        }));
    }

    win.on('close', async e => {
        e.preventDefault();

        const {response} = await dialog.showMessageBox(win, {
            type: 'question',
            title: '  Bestätigen  ',
            message: 'Programm schließen?',
            buttons: ['Ja', 'Abbrechen'],
        })

        response || win.destroy()
    });

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store window
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });


    return win;
}

// Im Hauptprozess.
const {ipcMain} = require('electron')
ipcMain.on('shell-external-request', (event, arg) => {
    console.log('Main: Shell external: REQUEST');
    console.log(arg);
    shell.openExternal(arg).then(() => {
        console.log('Main: Shell external: SUCCESS');
        event.reply('shell-external-reply', true);
    }, (reason) => {
        console.error('Main: Shell external: FAIL');
        console.error(reason);
        event.reply('shell-external-reply', false);
    });
});
ipcMain.on('shell-item-request', (event, arg) => {
    console.log('Main: Shell item: REQUEST');
    console.log(arg);
    shell.openPath(arg).then((response) => {
        console.log('Main: Shell item: SUCCESS');
        event.reply('shell-item-reply', response);
    }, (reason) => {
        console.error('Main: Shell item: FAIL');
        console.error(reason);
        event.reply('shell-item-reply', reason.toString());
    });
});
ipcMain.on('shell-file-request', (event, arg) => {
    console.log('Main: Shell file: REQUEST');
    console.log(arg);
    shell.openPath(arg).then((response) => {
        console.log('Main: Shell file: SUCCESS');
        event.reply('shell-file-reply', true);
    }, (reason) => {
        console.error('Main: Shell file: FAIL');
        console.error(reason);
        event.reply('shell-file-reply', false);
    });
});

try {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947

    if (!gotTheLock) {
        app.quit()
    } else {
        app.on('second-instance', (event, commandLine, workingDirectory) => {
            // Someone tried to run a second instance, we should focus our window.
            if (win) {
                if (win.isMinimized()) win.restore()
                win.focus()
            }
        })

        app.on('ready', () => setTimeout(createWindow, 400));

        // Quit when all windows are closed.
        app.on('window-all-closed', () => {
            // On OS X it is common for applications and their menu bar
            // to stay active until the user quits explicitly with Cmd + Q
            if (process.platform !== 'darwin') {
                app.quit();
            }
        });

        app.on('activate', () => {
            // On OS X it's common to re-create a window in the app when the
            // dock icon is clicked and there are no other windows open.
            if (win === null) {
                createWindow();
            }
        });

    }
} catch (e) {
    // Catch Error
    // throw e;
}
