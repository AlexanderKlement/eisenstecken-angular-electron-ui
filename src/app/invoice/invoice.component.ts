import {Component, OnInit} from '@angular/core';
import {AuthService} from '../shared/services/auth.service';
import {first} from 'rxjs/operators';
import {CustomButton} from '../shared/components/toolbar/toolbar.component';

@Component({
    selector: 'app-invoice',
    templateUrl: './invoice.component.html',
    styleUrls: ['./invoice.component.scss']
})
export class InvoiceComponent implements OnInit {
    outgoingInvoicesAvailable = false;
    ingoingInvoicesAvailable = false;

    constructor(private authService: AuthService) {
    }

    ngOnInit(): void {
        this.authService.currentUserHasRight('outgoing_invoices:all').pipe(first()).subscribe(allowed => {
            this.outgoingInvoicesAvailable = allowed;
        });
        this.authService.currentUserHasRight('ingoing_invoices:all').pipe(first()).subscribe(allowed => {
            this.ingoingInvoicesAvailable = allowed;
        });
    }

}
