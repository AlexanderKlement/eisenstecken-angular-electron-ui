import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {EmailService} from '../shared/services/email.service';
import {FileService} from '../shared/services/file.service';

@Component({
    selector: 'app-debug',
    templateUrl: './debug.component.html',
    styleUrls: ['./debug.component.scss']
})
export class DebugComponent implements OnInit {
    emailFormGroup: FormGroup;
    openFileFormGroup: FormGroup;
    showFileFormGroup: FormGroup;

    constructor(private email: EmailService, private file: FileService) {
    }

    ngOnInit(): void {
        this.initEmailGroup();
        this.initOpenFileGroup();
        this.initShowFileGroup();
    }

    onEmailSubmit(): void {
        this.email.sendMail(
            this.emailFormGroup.get('email').value,
            this.emailFormGroup.get('subject').value,
            this.emailFormGroup.get('body').value
        );
    }

    openFileSubmit() {
        this.file.open(this.openFileFormGroup.get('path').value).then((response) => {
            this.openFileFormGroup.get('response').setValue(response);
        });
    }

    showFileSubmit() {
        this.file.show(this.showFileFormGroup.get('path').value);
    }

    private initEmailGroup() {
        this.emailFormGroup = new FormGroup({
            email: new FormControl(''),
            subject: new FormControl(''),
            body: new FormControl(''),
        });
    }

    private initOpenFileGroup() {
        this.openFileFormGroup = new FormGroup({
            path: new FormControl(''),
            response: new FormControl('')
        });
    }

    private initShowFileGroup() {
        this.showFileFormGroup = new FormGroup({
            path: new FormControl('')
        });
    }
}
