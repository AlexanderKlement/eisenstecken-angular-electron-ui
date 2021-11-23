import {Injectable} from '@angular/core';
import {ElectronService} from '../../core/services';

@Injectable({
    providedIn: 'root'
})
export class FileService {

    constructor(private electronService: ElectronService) {
    }

    open(path: string): Promise<string> {
        if (!this.electronService.isElectron) {
            return new Promise((resolve, reject) => {
                reject();
            });
        }
        return new Promise<string>((resolve, reject) => {
            try {
                this.electronService.ipcRenderer.on('shell-item-reply', (_, data) => {
                    if (data) {
                        resolve(data);
                    } else {
                        reject();
                    }
                });
                this.electronService.ipcRenderer.send('shell-item-request', path);
            } catch (e) {
                console.warn(e);
                console.warn('Cannot send request to api');
                reject();
            }
        });
    }

    show(path: string): Promise<void> {
        if (!this.electronService.isElectron) {
            return new Promise((resolve, reject) => {
                reject();
            });
        }
        return new Promise<void>((resolve, reject) => {
            try {
                this.electronService.ipcRenderer.on('shell-file-reply', (_, data) => {
                    if (data) {
                        resolve();
                    } else {
                        reject();
                    }
                });
                this.electronService.ipcRenderer.send('shell-file-request', path);
            } catch (e) {
                console.warn(e);
                console.warn('Cannot send request to api');
                reject();
            }
        });
    }
}
