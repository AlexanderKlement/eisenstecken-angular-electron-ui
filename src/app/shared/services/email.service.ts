import {Injectable} from '@angular/core';
import {ElectronService} from '../../core/services';


@Injectable({
    providedIn: 'root'
})
export class EmailService {

    constructor(private electron: ElectronService) {
    }

    sendMail(mail: string, subject: string, body: string) {
        if (!this.electron.isElectron) {
            console.error('Cannot open mail client. This is only possible in native electron client');
            return;
        }
        //require('shell').openExternal('mailto:' + mail + '?subject=' + subject + '&body=' + body);
    }
}
