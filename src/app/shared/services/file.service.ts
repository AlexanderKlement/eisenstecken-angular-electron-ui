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
                window.api.receive('shell-item-reply', (data) => {
                    if (data) {
                        resolve(data);
                    } else {
                        reject();
                    }
                });
                window.api.send('shell-item-request', path);
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
                window.api.receive('shell-file-reply', (data) => {
                    if (data) {
                        resolve();
                    } else {
                        reject();
                    }
                });
                window.api.send('shell-file-request', path);
            } catch (e) {
                console.warn(e);
                console.warn('Cannot send request to api');
                reject();
            }
        });
    }
}
