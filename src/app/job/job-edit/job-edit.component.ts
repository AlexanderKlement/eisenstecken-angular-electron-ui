import { Component, OnInit } from '@angular/core';
import {Country, DefaultService, Job, JobCreate, JobType, JobUpdate, Lock} from "eisenstecken-openapi-angular-library";
import {Observable} from "rxjs";
import {FormControl, FormGroup} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {BaseEditComponent} from "../../shared/components/base-edit/base-edit.component";
import {MatDialog} from "@angular/material/dialog";
import {tap} from "rxjs/operators";

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
  unlockFunction = (afterUnlockFunction: VoidFunction = () => {}): void => {
    this.api.unlockJobJobUnlockJobIdPost(this.id).subscribe(() => {
      afterUnlockFunction();
    });
  };
  clientId: number;

  jobGroup: FormGroup;
  submitted = false;
  jobTypeOptions$: Observable<JobType[]>;
  countryOptions$: Observable<Country[]>;

  constructor(api: DefaultService, router: Router,  route: ActivatedRoute, dialog: MatDialog) {
    super(api, router, route, dialog);
  }

  ngOnInit(): void {
    super.ngOnInit();
    if(this.createMode)
      this.routeParams.subscribe((params) => {
        console.log(params);
        this.clientId =  parseInt(params.client_id);
        if(isNaN(this.clientId)){
          console.error("JobEdit: Cannot determine client id");
          this.router.navigateByUrl(this.navigationTarget);
        }
      });
    this.jobTypeOptions$ = this.api.getTypeOptionsJobTypeOptionsGet();
    this.countryOptions$ = this.api.readCountriesAddressCountriesGet();
    this.jobGroup = new FormGroup({
      name: new FormControl(""),
      description: new FormControl(""),
      type: new FormControl(""),
      address: new FormGroup( {
        street_number: new FormControl(""),
        city: new FormControl(""),
        cap: new FormControl(""),
        country: new FormControl("")
      }),
    });
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  onSubmit() : void {
    console.log(this.jobGroup.get("type").value);
    this.submitted = true;
    if(this.createMode){
      const jobCreate: JobCreate = {
        description: this.jobGroup.get("description").value,
        name: this.jobGroup.get("name").value,
        client_id: this.clientId,
        address: {
          name: this.jobGroup.get("name").value,
          street_number: this.jobGroup.get("address.street_number").value,
          city: this.jobGroup.get("address.city").value,
          cap: this.jobGroup.get("address.cap").value,
          country_code: this.jobGroup.get("address.country").value,
        },
        type: this.jobGroup.get("type").value
      };
      this.api.createJobJobPost(jobCreate).subscribe((job) => {
        this.createUpdateSuccess(job);
      }, (error) => {
        this.createUpdateError(error);
      }, () => {
        this.createUpdateComplete();
      });
    } else {
      const jobUpdate: JobUpdate = {
        description: this.jobGroup.get("description").value,
        name: this.jobGroup.get("name").value,
        address: {
          name: this.jobGroup.get("name").value,
          street_number: this.jobGroup.get("address.street_number").value,
          city: this.jobGroup.get("address.city").value,
          cap: this.jobGroup.get("address.cap").value,
          country_code: this.jobGroup.get("address.country").value,
        }
      };
      this.api.updateJobJobJobIdPut(this.id, jobUpdate).subscribe((job) => {
        this.createUpdateSuccess(job);
      }, (error) => {
        this.createUpdateError(error);
      }, () => {
        this.createUpdateComplete();
      });
    }
  }

  createUpdateSuccess(job: Job): void{
    this.id = job.id;
    this.unlockFunction(() => {
      this.router.navigateByUrl("job/" + job.id.toString());
    });
  }

  observableReady() :void {
    super.observableReady();
    if(!this.createMode){
      this.data$.pipe(tap(job => this.jobGroup.patchValue(job))).subscribe((job) => {
        this.jobGroup.patchValue({
          name: job.orderable.name,
          type: job.type.toString(),
          address: {
            country: job.address.country.code
          }
        });
      });
    }
  }


}
