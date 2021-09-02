import {Component, OnInit, ViewChild} from '@angular/core';
import {InfoDataSource} from "../../shared/components/info-builder/info-builder.datasource";
import {Job, DefaultService, JobStatus, Offer} from "eisenstecken-openapi-angular-library";
import {ActivatedRoute, Router} from "@angular/router";
import {InfoBuilderComponent} from "../../shared/components/info-builder/info-builder.component";
import {Observable} from "rxjs";
import { map} from "rxjs/operators";
import {TableDataSource} from "../../shared/components/table-builder/table-builder.datasource";
import {LockService} from "../../shared/lock.service";

@Component({
  selector: 'app-job-detail',
  templateUrl: './job-detail.component.html',
  styleUrls: ['./job-detail.component.scss']
})
export class JobDetailComponent implements OnInit {

  public infoDataSource: InfoDataSource<Job>;
  public selectedJobStatus: Observable<JobStatus>;
  public jobId: number;

  @ViewChild(InfoBuilderComponent) child:InfoBuilderComponent<Job>;
  offerDataSource: TableDataSource<Offer>;




  public buttons = [
    [
      "Bearbeiten",
      (): void => {
        this.child.editButtonClicked();
      }
    ],
    [
      "Neues Angebot",
      (): void => {
        this.router.navigateByUrl('/offer/edit/new/' + this.jobId.toString());
      }
    ]
  ];

  constructor(private api: DefaultService, private router: Router, private route: ActivatedRoute, private locker: LockService) { }

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
      this.jobId = id;
      this.selectedJobStatus = this.api.readJobJobJobIdGet(id).pipe(map((job) : JobStatus => {
        return job.status;
      }));
      this.initOfferTable();
      this.initJobDetail(id);
    });
  }

  private initOfferTable(){
    this.offerDataSource = new TableDataSource(
      this.api,
      ( api, filter, sortDirection, skip, limit) => {
        return api.readOffersByJobOfferJobJobIdGet(this.jobId, filter, skip, limit);
      },
      (dataSourceClasses) => {
        const rows = [];
        dataSourceClasses.forEach((dataSource) => {
          rows.push(
            {
              values: {
                id: dataSource.id,
                date: dataSource.date,
                full_price_with_vat: dataSource.full_price_with_vat
              },
              route : () => {
                this.locker.getLockAndTryNavigate(
                  this.api.islockedOfferOfferIslockedOfferIdGet(dataSource.id),
                  this.api.lockOfferOfferLockOfferIdPost(dataSource.id),
                  this.api.lockOfferOfferUnlockOfferIdPost(dataSource.id),
                  "job/edit/" + dataSource.id.toString()
                );
              }
            });
        });
        return rows;
      },
      [
        {name: "id", headerName: "ID"},
        {name: "date", headerName: "Datum"},
        {name: "full_price_with_vat", headerName: "Preis"}
      ],
      (api) => {
        return api.countOffersByJobOfferJobCountJobIdGet(this.jobId);
      }
    );
    this.offerDataSource.loadData();
  }

  private initJobDetail(id: number) {
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
      "/job/edit/" + this.jobId.toString(),
      this.api.islockedJobJobIslockedJobIdGet(this.jobId),
      this.api.lockJobJobLockJobIdPost(this.jobId),
      this.api.unlockJobJobUnlockJobIdPost(this.jobId)
    );
  }

}
