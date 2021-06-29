import { Component, OnInit } from '@angular/core';
import {InfoDataSource} from "../../shared/components/info-builder/info-builder.datasource";
import {Job, DefaultService} from "eisenstecken-openapi-angular-library";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-job-detail',
  templateUrl: './job-detail.component.html',
  styleUrls: ['./job-detail.component.scss']
})
export class JobDetailComponent implements OnInit {

  public infoDataSource: InfoDataSource<Job>;
  constructor(private api: DefaultService, private router: Router, private route: ActivatedRoute) { }

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
          this.api.lockJobJobUnlockJobIdPost(id).subscribe(); //TODO: this function is nor working anymore after next api update
        },() => {
          this.api.lockJobJobLockJobIdPost(id).subscribe();
        },
        this.api.readUsersMeUsersMeGet()
      );
    });
  }

}
