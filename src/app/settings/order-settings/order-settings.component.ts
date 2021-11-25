import {Component, OnInit} from '@angular/core';
import {BaseSettingsComponent} from '../base-settings.component';
import {DefaultService} from 'eisenstecken-openapi-angular-library';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
    selector: 'app-order-settings',
    templateUrl: './order-settings.component.html',
    styleUrls: ['./order-settings.component.scss']
})
export class OrderSettingsComponent extends BaseSettingsComponent implements OnInit {

    keyList = [
        'order_text',
        'order_mail',
        'order_subject'
    ];

    constructor(protected api: DefaultService, protected snackBar: MatSnackBar) {
        super(api, snackBar);
    }

    ngOnInit(): void {
        super.ngOnInit();
    }

}
