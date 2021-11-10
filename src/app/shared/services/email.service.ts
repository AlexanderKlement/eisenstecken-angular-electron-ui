import {Injectable} from '@angular/core';
import {ElectronService} from '../../core/services';

@Injectable({
    providedIn: 'root'
})
export class EmailService {

    constructor() {
    }

    sendMail(mail: string, subject: string, body: string): Promise<void> {
        const mailSchema = 'mailto:' + mail + '?subject=' + subject + '&body=' + body;

        return new Promise<void>((resolve, reject) => {
            try {
                window.api.receive('shell-external-reply', (data) => {
                    if (data) {
                        resolve();
                    } else {
                        reject();
                    }
                });
                window.api.send('shell-external-request', mailSchema);
            } catch (e) {
                console.warn(e);
                console.warn('Cannot send request to api');
                reject();
            }
        });
    }
}
