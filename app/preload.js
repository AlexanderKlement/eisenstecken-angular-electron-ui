var _a = require('electron'), contextBridge = _a.contextBridge, ipcRenderer = _a.ipcRenderer;
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
    send: function (channel, data) {
        // whitelist channels
        var validChannels = ['shell-external-request', 'shell-item-request', 'shell-file-request'];
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    receive: function (channel, func) {
        var validChannels = ['shell-external-reply', 'shell-item-reply', 'shell-file-reply'];
        if (validChannels.includes(channel)) {
            // Deliberately strip event as it includes `sender`
            ipcRenderer.on(channel, function (event) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                return func.apply(void 0, args);
            });
        }
    }
});
console.log('Preload has been loaded');
//# sourceMappingURL=preload.js.map