import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {EmailService} from '../shared/services/email.service';

@Component({
    selector: 'app-debug',
    templateUrl: './debug.component.html',
    styleUrls: ['./debug.component.scss']
})
export class DebugComponent implements OnInit {
    emailFormGroup: FormGroup;

    constructor(private email: EmailService) {
    }

    ngOnInit(): void {
        this.initEmailGroup();
    }

    onEmailSubmit(): void {
        this.email.sendMail(
            this.emailFormGroup.get('email').value,
            this.emailFormGroup.get('subject').value,
            this.emailFormGroup.get('body').value
        );
    }

    private initEmailGroup() {
        this.emailFormGroup = new FormGroup({
            email: new FormControl(''),
            subject: new FormControl(''),
            body: new FormControl(''),
        });
    }
}
