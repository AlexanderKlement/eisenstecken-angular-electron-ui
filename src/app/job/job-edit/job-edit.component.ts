import { Component, OnInit } from '@angular/core';
import {
  DefaultService,
  Job,
  JobCreate,
  JobType,
  JobUpdate,
  Lock,
  SubJobCreate
} from "eisenstecken-openapi-angular-library";
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
  subMode = false;
  mainJobId: number;

  jobGroup: FormGroup;
  submitted = false;
  jobTypeOptions$: Observable<JobType[]>;

  constructor(api: DefaultService, router: Router,  route: ActivatedRoute, dialog: MatDialog) {
    super(api, router, route, dialog);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.initJobGroup();
    if(this.createMode)
      this.routeParams.subscribe((params) => {
        if(params.sub !== undefined && params.sub == "sub"){
          this.subMode = true;
          this.mainJobId = parseInt(params.job_id);
          if(isNaN(this.mainJobId)){
            console.error("JobEdit: Cannot determine mainJob id");
            this.router.navigateByUrl(this.navigationTarget);
          }
        } else {
          this.clientId =  parseInt(params.client_id);
          if(isNaN(this.clientId)){
            console.error("JobEdit: Cannot determine client id");
            this.router.navigateByUrl(this.navigationTarget);
          }
        }

      });
    this.jobTypeOptions$ = this.api.getTypeOptionsJobTypeOptionsGet();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  initJobGroup(): void{
    if(!this.subMode){
      this.jobGroup = new FormGroup({
        name: new FormControl(""),
        description: new FormControl(""),
        type: new FormControl("JOBTYPE_MAIN"),
        address: new FormGroup( {
          street_number: new FormControl(""),
          city: new FormControl(""),
          cap: new FormControl(""),
          country: new FormControl("IT")
        }),
      });
    } else {
      this.jobGroup = new FormGroup({
        name: new FormControl(""),
        description: new FormControl(""),
        type: new FormControl("JOBTYPE_SUB"),
        address: new FormGroup( {
          street_number: new FormControl(""),
          city: new FormControl(""),
          cap: new FormControl(""),
          country: new FormControl("IT")
        }),
      });
    }

  }

  onSubmit() : void {
    this.submitted = true;
    if(this.createMode){
      if(!this.subMode){
        this.onSubmitMainJobCreate();
      } else {
        this.onSubmitSubJobCreate();
      }
    } else {
      if(!this.subMode){
        this.onSubmitMainJobEdit();
      } else {
        this.onSubmitSubJobEdit();
      }
    }
  }

  private onSubmitMainJobCreate(): void{
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
  }

  private onSubmitSubJobCreate(): void {
    const subJobCreate: SubJobCreate = {
      description: this.jobGroup.get("description").value,
      name: this.jobGroup.get("name").value,
    };
    this.api.addSubjobToJobJobSubJobJobIdPost(this.mainJobId, subJobCreate).subscribe((job) => {
      this.createUpdateSuccess(job);
    }, (error) => {
      this.createUpdateError(error);
    }, () => {
      this.createUpdateComplete();
    });

  }

  private onSubmitMainJobEdit(): void {
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

  private onSubmitSubJobEdit(): void {
    const subJobCreate: SubJobCreate = {
      description: this.jobGroup.get("description").value,
      name: this.jobGroup.get("name").value,
    };
    this.api.updateSubjobJobSubJobSubjobIdPut(this.id, subJobCreate).subscribe((job) => {
      this.createUpdateSuccess(job);
    }, (error) => {
      this.createUpdateError(error);
    }, () => {
      this.createUpdateComplete();
    });
  }


  createUpdateSuccess(job: Job): void{
    this.id = job.id;
    this.unlockFunction(() => {
      this.router.navigateByUrl("job/" + job.id.toString());
    });
  }

  observableReady() :void {
    super.observableReady();
    if(!this.createMode){ //TODO: pipe all this values to first()
      this.data$.pipe(tap(job => this.jobGroup.patchValue(job))).subscribe((job) => {
        this.subMode = job.is_sub;
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

  getAddressGroup(): FormGroup {
    return <FormGroup> this.jobGroup.get('address');
  }

  //TODO: change how job-type is changed. There should only be a checkbox for minijobs
}
