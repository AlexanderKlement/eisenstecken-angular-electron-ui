import {Component, OnInit} from '@angular/core';
import {AuthService} from '../shared/auth.service';
import {InfoDialogComponent} from './info-dialog/info-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {FormArray, FormGroup} from '@angular/forms';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    constructor(private authService: AuthService, private dialog: MatDialog) {
    }


    ngOnInit(): void {
    }

    showInfoClicked(): void {
        this.dialog.open(InfoDialogComponent, {
            width: (window.innerWidth - 100).toString() + 'px',
            data: {}
        });
    }

    logoutClicked(): void {
        console.log('Logout clicked');
        this.authService.doLogout();
    }
}

