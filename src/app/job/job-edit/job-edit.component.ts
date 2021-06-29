import { Component, OnInit } from '@angular/core';
import {DefaultService, Job, Lock} from "eisenstecken-openapi-angular-library";
import {Observable} from "rxjs";
import {FormGroup} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {BaseEditComponent} from "../../shared/components/base-edit/base-edit.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-job-edit',
  templateUrl: './job-edit.component.html',
  styleUrls: ['./job-edit.component.scss']
})
export class JobEditComponent extends BaseEditComponent<Job> implements OnInit{

  navigationTarget = "/job";
  lockFunction = (api: DefaultService, id: number): Observable<Lock> => {
    return api.islockedJobJobIslockedJobIdGet(id);
  };
  dataFunction = (api: DefaultService, id: number): Observable<Job> => {
    return api.readJobJobJobIdGet(id);
  };

  jobGroup: FormGroup;

  constructor(api: DefaultService, router: Router,  route: ActivatedRoute, dialog: MatDialog) {
    super(api, router, route, dialog);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  send(): void {

  }
}
