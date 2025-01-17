import {Component, OnDestroy, OnInit} from '@angular/core';
import {
    DefaultService,
    Job,
    JobCreate,
    JobUpdate,
    Lock,
    SubJobCreate
} from 'eisenstecken-openapi-angular-library';
import {Observable} from 'rxjs';
import {FormControl, FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {BaseEditComponent} from '../../shared/components/base-edit/base-edit.component';
import {MatDialog} from '@angular/material/dialog';
import {first, tap} from 'rxjs/operators';

@Component({
    selector: 'app-job-edit',
    templateUrl: './job-edit.component.html',
    styleUrls: ['./job-edit.component.scss']
})
export class JobEditComponent extends BaseEditComponent<Job> implements OnInit, OnDestroy {

    clientId: number;
    subMode = false;
    mainJobId: number;

    jobGroup: FormGroup;
    submitted = false;

    navigationTarget = 'job';

    addressDeactivated = true;
    title = 'Auftrag: Bearbeiten';

    constructor(api: DefaultService, router: Router, route: ActivatedRoute, dialog: MatDialog) {
        super(api, router, route, dialog);
    }


    lockFunction = (api: DefaultService, id: number): Observable<Lock> => api.islockedJobJobIslockedJobIdGet(id);
    dataFunction = (api: DefaultService, id: number): Observable<Job> => api.readJobJobJobIdGet(id);
    unlockFunction = (api: DefaultService, id: number): Observable<boolean> => api.unlockJobJobUnlockJobIdPost(id);


    ngOnInit(): void {
        super.ngOnInit();
        this.initJobGroup();
        if (this.createMode) {
            this.routeParams.subscribe((params) => {
                if (params.sub !== undefined && params.sub === 'sub') {
                    this.subMode = true;
                    this.mainJobId = parseInt(params.job_id, 10);
                    if (isNaN(this.mainJobId)) {
                        console.error('JobEdit: Cannot determine mainJob id');
                        this.router.navigateByUrl(this.navigationTarget);
                    }
                } else {
                    this.clientId = parseInt(params.client_id, 10);
                    if (isNaN(this.clientId)) {
                        console.error('JobEdit: Cannot determine client id');
                        this.router.navigateByUrl(this.navigationTarget);
                    }
                }

            });
        }
        if (this.createMode && !this.subMode) {
            this.title = 'Auftrag: Erstellen';
        }
        if (this.subMode) {
            this.title = this.createMode ? 'Unterauftrag: Erstellen' : 'Unterauftrag: Bearbeiten'
        }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    initJobGroup(): void {
        if (!this.subMode) {
            this.jobGroup = new FormGroup({
                name: new FormControl(''),
                description: new FormControl(''),
                minijob: new FormControl(false),
                address: new FormGroup({
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    street_number: new FormControl(''),
                    city: new FormControl(''),
                    cap: new FormControl(''),
                    country: new FormControl('IT')
                }),
            });
        } else {
            this.jobGroup = new FormGroup({
                name: new FormControl(''),
                description: new FormControl(''),
                minijob: new FormControl(false),
                address: new FormGroup({
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    street_number: new FormControl(''),
                    city: new FormControl(''),
                    cap: new FormControl(''),
                    country: new FormControl('IT')
                }),
            });
        }
    }

    onSubmit(): void {
        this.submitted = true;
        if (this.createMode) {
            if (!this.subMode) {
                this.onSubmitMainJobCreate();
            } else {
                this.onSubmitSubJobCreate();
            }
        } else {
            if (!this.subMode) {
                this.onSubmitMainJobEdit();
            } else {
                this.onSubmitSubJobEdit();
            }
        }
    }

    createUpdateSuccess(job: Job, redirectMain = false): void {
        this.id = job.id;
        if (redirectMain) {
            job.id = this.mainJobId;
        }
        this.router.navigateByUrl('job/' + job.id.toString(), {replaceUrl: true});
    }

    observableReady(): void {
        super.observableReady();
        if (!this.createMode) {
            this.data$.pipe(tap(job => this.jobGroup.patchValue(job)), first()).subscribe((job) => {
                this.subMode = job.is_sub;
                this.jobGroup.patchValue({
                    name: job.name,
                    minijob: job.is_mini,
                    address: {
                        country: job.address.country.code
                    }
                });
            });
        }
    }

    getAddressGroup(): FormGroup {
        return this.jobGroup.get('address') as FormGroup;
    }

    private onSubmitMainJobCreate(): void {
        const jobCreate: JobCreate = {
            description: this.jobGroup.get('description').value,
            name: this.jobGroup.get('name').value,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            client_id: this.clientId,
            address: {
                name: this.jobGroup.get('name').value,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                street_number: this.jobGroup.get('address.street_number').value,
                city: this.jobGroup.get('address.city').value,
                cap: this.jobGroup.get('address.cap').value,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                country_code: this.jobGroup.get('address.country').value,
            },
            type: this.jobGroup.get('minijob').value ? 'JOBYTPE_MINI' : 'JOBTYPE_MAIN',
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
            description: this.jobGroup.get('description').value,
            name: this.jobGroup.get('name').value,
        };
        this.api.addSubjobToJobJobSubJobJobIdPost(this.mainJobId, subJobCreate).subscribe((job) => {
            this.createUpdateSuccess(job, true);
        }, (error) => {
            this.createUpdateError(error);
        }, () => {
            this.createUpdateComplete();
        });

    }

    private onSubmitMainJobEdit(): void {
        const jobUpdate: JobUpdate = {
            description: this.jobGroup.get('description').value,
            name: this.jobGroup.get('name').value,
            address: {
                name: this.jobGroup.get('name').value,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                street_number: this.jobGroup.get('address.street_number').value,
                city: this.jobGroup.get('address.city').value,
                cap: this.jobGroup.get('address.cap').value,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                country_code: this.jobGroup.get('address.country').value,
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
            description: this.jobGroup.get('description').value,
            name: this.jobGroup.get('name').value,
        };
        this.api.updateSubjobJobSubJobSubjobIdPut(this.id, subJobCreate).subscribe((job) => {
            this.createUpdateSuccess(job);
        }, (error) => {
            this.createUpdateError(error);
        }, () => {
            this.createUpdateComplete();
        });
    }
}
