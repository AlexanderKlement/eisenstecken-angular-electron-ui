import {Component} from '@angular/core';
import {ElectronService} from './core/services';
import {TranslateService} from '@ngx-translate/core';
import {DefaultService} from 'eisenstecken-openapi-angular-library';
import {APP_CONFIG} from '../environments/environment';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    constructor(
        private electronService: ElectronService,
        private translate: TranslateService,
        private apiGateway: DefaultService
    ) {
        this.translate.setDefaultLang('de');
        console.log('APP_CONFIG', APP_CONFIG);

        if (electronService.isElectron) {
            console.log(process.env);
            console.log('Run in electron');
            //console.log('Electron ipcRenderer', this.electronService.ipcRenderer);
            console.log('NodeJS childProcess', this.electronService.childProcess);
        } else {
            console.log('Run in browser');
        }
    }
}
