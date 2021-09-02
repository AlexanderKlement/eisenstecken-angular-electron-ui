import {Component, OnInit, ViewChild} from '@angular/core';
import {InfoDataSource} from "../../shared/components/info-builder/info-builder.datasource";
import {Job, DefaultService, JobStatus, Offer, Lock} from "eisenstecken-openapi-angular-library";
import {ActivatedRoute, Router} from "@angular/router";
import {InfoBuilderComponent} from "../../shared/components/info-builder/info-builder.component";
import {Observable} from "rxjs";
import {first, map} from "rxjs/operators";
import {TableDataSource} from "../../shared/components/table-builder/table-builder.datasource";

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

  offerLockFuncton = (api: DefaultService, id: number): Observable<Lock> => {
    return api.islockedOfferOfferIslockedOfferIdGet(id);
  };



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
                const lock = this.offerLockFuncton(this.api, dataSource.id);
                lock.pipe(first()).subscribe((lock) => {
                  if(lock.locked){
                    this.api.readUsersMeUsersMeGet().pipe(first()).subscribe((user) => {
                      if(user.id == lock.user.id){
                        this.lockAndNavigate(dataSource.id);
                      } else {
                        this.showLockDialog(lock);
                      }
                    });
                  }
                  else {
                    this.lockAndNavigate(dataSource.id);
                  }
                });
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

  private lockAndNavigate(id: number) {
    this.router.navigateByUrl('offer/edit/' + id.toString());
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
      () => {
        this.router.navigateByUrl('/job/edit/' + id.toString());
      },
      () => {
        return this.api.islockedJobJobIslockedJobIdGet(id);
      },() => {
        this.api.unlockJobJobUnlockJobIdPost(id).subscribe();
      },(afterFunction: VoidFunction) => {
        this.api.lockJobJobLockJobIdPost(id).subscribe(afterFunction);
      },
      this.api.readUsersMeUsersMeGet()
    );
  }

}
