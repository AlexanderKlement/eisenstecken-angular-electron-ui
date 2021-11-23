import {Injectable} from '@angular/core';
import {ElectronService} from '../../core/services';

@Injectable({
    providedIn: 'root'
})
export class EmailService {

    constructor(private electronService: ElectronService) {
    }

    sendMail(mail: string, subject: string, body: string): Promise<void> {
        if (!this.electronService.isElectron) {
            return new Promise((resolve, reject) => {
                reject();
            });
        }
        const mailSchema = 'mailto:' + mail + '?subject=' + subject + '&body=' + body;

        return new Promise<void>((resolve, reject) => {
            try {
                this.electronService.ipcRenderer.on('shell-external-reply', (_, data) => {
                    if (data) {
                        resolve();
                    } else {
                        reject();
                    }
                });
                this.electronService.ipcRenderer.send('shell-external-request', mailSchema);
            } catch (e) {
                console.warn(e);
                console.warn('Cannot send request to api');
                reject();
            }
        });
    }
}
