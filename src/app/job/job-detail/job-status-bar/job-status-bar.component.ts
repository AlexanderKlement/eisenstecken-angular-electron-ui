import {Component, Input, OnInit, Output} from '@angular/core';
import {DefaultService, JobStatus, JobStatusType} from "eisenstecken-openapi-angular-library";
import {Observable, ReplaySubject, Subject} from "rxjs";
import {map, tap} from "rxjs/operators";

@Component({
  selector: 'app-job-status-bar',
  templateUrl: './job-status-bar.component.html',
  styleUrls: ['./job-status-bar.component.scss']
})
export class JobStatusBarComponent implements OnInit {

  public jobStatusList: ReplaySubject<JobStatus[]>;
  public toolBarColor = "created";
  public selectStatusSubject: Subject<JobStatus>;
  @Input() selectedStatus: Observable<JobStatus>;
  @Input() jobId: number;


  private colorMap = [
    [JobStatusType.Created, "created"],
    [JobStatusType.Accepted, "accepted"],
    [JobStatusType.Finished, "finished"],
    [JobStatusType.Other, "other"]
  ];

  constructor(private api: DefaultService) {}


  ngOnInit(): void {
    this.jobStatusList = new ReplaySubject<JobStatus[]>(1);
    this.api.getStatusOptionsJobStatusOptionsGet().subscribe((jobStatusList) => {
      this.jobStatusList.next(jobStatusList);
    });
    this.selectStatusSubject = new Subject<JobStatus>();
    this.selectStatusSubject.subscribe((selectedStatus) => {
      this.changeColor(selectedStatus);
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

  private getStatus(status_name: string): Observable<JobStatus> {
    return this.jobStatusList.pipe(map ((jobStatusList) => {
      for(let i = 0; i< jobStatusList.length; i++){
        if(jobStatusList[i].status == status_name)
          return jobStatusList[i];
      }
      console.error("JobStatusBar: Did not find status of job");
      return null;
    }));
  }

  private changeColor(selectedStatus: JobStatus): void {
    if(selectedStatus != null){
      this.toolBarColor = this.getColorWithEnum(selectedStatus.status);
    }
  }

  private getColorWithEnum(enum_str: string): string {
    for(let i=0; i< this.colorMap.length; i++){
      if(this.colorMap[i][0] == enum_str)
        return this.colorMap[i][1];
    }
  }

}
