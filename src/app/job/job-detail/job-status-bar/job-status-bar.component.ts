import {Component, Input, OnInit} from '@angular/core';
import {DefaultService, JobStatus, JobStatusType} from 'eisenstecken-openapi-angular-library';
import {Observable, ReplaySubject, Subject} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
    selector: 'app-job-status-bar',
    templateUrl: './job-status-bar.component.html',
    styleUrls: ['./job-status-bar.component.scss']
})
export class JobStatusBarComponent implements OnInit {

    public jobStatusList: ReplaySubject<JobStatus[]>;
    public toolBarColor = 'created';
    public selectStatusSubject: Subject<JobStatus>;
    public selectedStatusHeader: string;
    @Input() selectedStatus: Observable<JobStatus>;
    @Input() jobId: number;


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
        this.api.getStatusOptionsJobStatusOptionsGet().subscribe((jobStatusList) => {
            this.jobStatusList.next(jobStatusList);
        });
        this.selectStatusSubject = new Subject<JobStatus>();
        this.selectStatusSubject.subscribe((selectedStatus) => {
            this.setupBar(selectedStatus);
            this.updateStatus(selectedStatus);
        });
        this.selectedStatus.subscribe((selectedStatus) => {
            this.selectStatusSubject.next(selectedStatus);
        });
    }

    public statusClicked(status: string): void {
        this.getStatus(status).subscribe((selectedStatus) => {
            this.selectStatusSubject.next(selectedStatus);
        });
    }

    private updateStatus(selectedStatus): void {
        this.api.updateJobStatusJobStatusJobIdPost(this.jobId, selectedStatus.status).subscribe();
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

    private setupBar(selectedStatus: JobStatus): void {
        this.changeStatus(selectedStatus);
        this.changeColor(selectedStatus);
    }

    private changeStatus(selectedStatus: JobStatus): void {
        this.selectedStatusHeader = 'Status: ' + selectedStatus.text.translation;
    }

    private changeColor(selectedStatus: JobStatus): void {
        if (selectedStatus != null) {
            this.toolBarColor = this.getColorWithEnum(selectedStatus.status);
        }
    }

    private getColorWithEnum(enumString: string): string {
        for (const color of this.colorMap) {
            if (color[0] === enumString) {
                return color[1];
            }
        }
    }

}
