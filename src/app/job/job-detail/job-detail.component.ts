import {Component, OnInit, ViewChild} from '@angular/core';
import {InfoDataSource} from "../../shared/components/info-builder/info-builder.datasource";
import {Job, DefaultService, JobStatus} from "eisenstecken-openapi-angular-library";
import {ActivatedRoute, Router} from "@angular/router";
import {InfoBuilderComponent} from "../../shared/components/info-builder/info-builder.component";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

@Component({
  selector: 'app-job-detail',
  templateUrl: './job-detail.component.html',
  styleUrls: ['./job-detail.component.scss']
})
export class JobDetailComponent implements OnInit {

  public infoDataSource: InfoDataSource<Job>;
  public selectedJobStatus: Observable<JobStatus>;
  constructor(private api: DefaultService, private router: Router, private route: ActivatedRoute) { }

  public buttons = [
    [
      "Bearbeiten",
      (): void => {
        this.child.editButtonClicked();
      }
    ]
  ];

  @ViewChild(InfoBuilderComponent) child:InfoBuilderComponent<Job>;

  ngOnInit(): void {
    this.route.params.subscribe( (params) => {
      let id: number;
      try{
        id = parseInt(params.id);
      } catch {
        console.error("Cannot parse given id");
        this.router.navigate(['Job']);
        return;
      }
      this.selectedJobStatus = this.api.readJobJobJobIdGet(id).pipe(map((job) : JobStatus => {
        return job.status; //TODO: this is executed way to late. The Observable is already read as null on this point
      }));
      this.infoDataSource = new InfoDataSource<Job>(
        this.api.readJobJobJobIdGet(id),
        [
          {
            property: "orderable.name",
            name: "Name"
          },
          {
            property: "description",
            name: "Beschreibung"
          },
          {
            property: "year",
            name: "Jahr"
          },
          {
            property: "status",
            name: "Status"
          }
        ],
        () => {
          this.router.navigateByUrl('/job/edit/' + id.toString());
        },
        () => {
          return this.api.islockedJobJobIslockedJobIdGet(id);
        },() => {
          this.api.unlockJobJobUnlockJobIdPost(id).subscribe(); //TODO: this function is nor working anymore after next api update
        },(afterFunction: VoidFunction) => {
          this.api.lockJobJobLockJobIdPost(id).subscribe(afterFunction);
        },
        this.api.readUsersMeUsersMeGet()
      );
    });
  }

}
