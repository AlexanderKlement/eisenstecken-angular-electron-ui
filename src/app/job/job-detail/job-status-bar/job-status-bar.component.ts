import {Component, Input, OnInit} from '@angular/core';
import {DefaultService, JobStatus, JobStatusType} from 'eisenstecken-openapi-angular-library';
import {Observable, ReplaySubject, Subject} from 'rxjs';
import {first, map} from 'rxjs/operators';
import {cli} from 'webdriver-manager/built/lib/cli_instance';

@Component({
    selector: 'app-job-status-bar',
    templateUrl: './job-status-bar.component.html',
    styleUrls: ['./job-status-bar.component.scss']
})
export class JobStatusBarComponent implements OnInit {

    @Input() jobId: number;
    public jobStatusList: ReplaySubject<JobStatus[]>;
    public toolBarColor = 'created';
    public selectedStatus: JobStatus;
    public loading = true;


    private colorMap = [
        [JobStatusType.Created, 'created'],
        [JobStatusType.Accepted, 'accepted'],
        [JobStatusType.Completed, 'completed'],
        [JobStatusType.Declined, 'declined']
    ];

    constructor(private api: DefaultService) {
    }


    ngOnInit(): void {
        this.jobStatusList = new ReplaySubject<JobStatus[]>(1);
        this.api.getStatusOptionsJobStatusOptionsGet().pipe(first()).subscribe((jobStatusList) => {
            this.jobStatusList.next(jobStatusList);
        });
        this.api.readJobStatusJobStatusJobIdGet(this.jobId).pipe(first()).subscribe(jobStatus => {
            this.selectedStatus = jobStatus;
            this.refresh();
            this.loading = false;
        });
    }

    public onStatusClicked(clickedJobStatus: JobStatus): void {
        this.api.updateJobStatusJobStatusJobIdPost(this.jobId, clickedJobStatus.status).pipe(first()).subscribe(newJobStatusType => {
                this.getStatus(newJobStatusType).pipe(first()).subscribe(newJobStatus => {
                    this.selectedStatus = newJobStatus;
                    this.refresh();
                });
            },
            error => {
                console.log(error);
            });
    }


    private getStatus(statusName: string): Observable<JobStatus> {
        return this.jobStatusList.pipe(map((jobStatusList) => {
            for (const jobStatus of jobStatusList) {
                if (jobStatus.status === statusName) {
                    return jobStatus;
                }
            }
            console.error('JobStatusBar: Did not find status of job');
            return null;
        }));
    }

    private refresh(): void {
        this.toolBarColor = this.getColorWithEnum(this.selectedStatus.status);
    }

    private getColorWithEnum(enumString: string): string {
        for (const color of this.colorMap) {
            if (color[0] === enumString) {
                return color[1];
            }
        }
    }

}
