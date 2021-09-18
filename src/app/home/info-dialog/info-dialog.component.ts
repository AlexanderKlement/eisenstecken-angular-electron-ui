import { Component, OnInit } from '@angular/core';
import {DefaultService} from 'eisenstecken-openapi-angular-library';

@Component({
  selector: 'app-info-dialog',
  templateUrl: './info-dialog.component.html',
  styleUrls: ['./info-dialog.component.scss']
})
export class InfoDialogComponent implements OnInit {

  constructor(private api: DefaultService) {

  }

  ngOnInit(): void {
  }

}
