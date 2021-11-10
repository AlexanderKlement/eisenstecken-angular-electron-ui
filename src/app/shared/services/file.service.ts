import {Injectable} from '@angular/core';
import {ElectronService} from '../../core/services';

@Injectable({
    providedIn: 'root'
})
export class FileService {

    constructor() {
    }

    open(path: string): Promise<string> {
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
