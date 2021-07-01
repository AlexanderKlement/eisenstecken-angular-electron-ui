import { Component, OnInit } from '@angular/core';
import {DefaultService, Job, JobType, Lock} from "eisenstecken-openapi-angular-library";
import {Observable} from "rxjs";
import {FormControl, FormGroup} from "@angular/forms";
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

  jobGroup: FormGroup = new FormGroup( {
    nameInput: new FormControl(),
    descriptionInput: new FormControl(),
    typeSelect: new FormControl()
  });
  submitted = false;
  jobTypeOptions$: Observable<JobType[]>;

  constructor(api: DefaultService, router: Router,  route: ActivatedRoute, dialog: MatDialog) {
    super(api, router, route, dialog);
    this.route.params.subscribe((params) => {
      console.log("Client id: ");
      console.log( params.client_id);
    });
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.jobTypeOptions$ = this.api.getTypeOptionsJobTypeOptionsGet();
  }

  send(): void {

  }
}
