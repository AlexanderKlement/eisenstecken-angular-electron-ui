import {Component, Input, OnInit, Output} from '@angular/core';
import {DefaultService, JobStatus, JobStatusType} from "eisenstecken-openapi-angular-library";
import {Observable, ReplaySubject} from "rxjs";
import {map, tap} from "rxjs/operators";

@Component({
  selector: 'app-job-status-bar',
  templateUrl: './job-status-bar.component.html',
  styleUrls: ['./job-status-bar.component.scss']
})
export class JobStatusBarComponent implements OnInit {

  public jobStatusList: ReplaySubject<JobStatus[]>;
  public toolBarColor = "created";
  @Input() selectedStatus: JobStatus;


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
    this.changeColor();
  }

  public statusClicked(status: string): void {
    this.getStatus(status).pipe(tap((selectedStatus) => {
      console.log(selectedStatus);
      this.selectedStatus = selectedStatus;
      this.changeColor();
    })).subscribe();
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

  private changeColor(): void {
    if(this.selectedStatus != null){
      console.log(this.toolBarColor);
      this.toolBarColor = this.getColorWithEnum(this.selectedStatus.status);
    }
  }

  private getColorWithEnum(enum_str: string): string {
    for(let i=0; i< this.colorMap.length; i++){
      if(this.colorMap[i][0] == enum_str)
        return this.colorMap[i][1];
    }
  }

}
