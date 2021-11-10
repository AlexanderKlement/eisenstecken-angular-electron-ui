
const {
    contextBridge,
    ipcRenderer
} = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    'api', {
        send: (channel, data) => {
            // whitelist channels
            const validChannels = ['shell-external-request', 'shell-item-request', 'shell-file-request'];
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, data);
            }
        },
        receive: (channel, func) => {
            const validChannels = ['shell-external-reply', 'shell-item-reply', 'shell-file-reply'];
            if (validChannels.includes(channel)) {
                // Deliberately strip event as it includes `sender`
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        }
    }
);

console.log('Preload has been loaded');
