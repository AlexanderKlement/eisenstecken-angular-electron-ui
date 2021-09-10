import {Component, OnInit, ViewChild} from '@angular/core';
import {Client, DefaultService, Job} from 'eisenstecken-openapi-angular-library';
import {InfoDataSource} from '../../shared/components/info-builder/info-builder.datasource';
import {ActivatedRoute, Router} from '@angular/router';
import {TableDataSource} from '../../shared/components/table-builder/table-builder.datasource';
import {InfoBuilderComponent} from '../../shared/components/info-builder/info-builder.component';
import {CustomButton} from '../../shared/components/toolbar/toolbar.component';

@Component({
  selector: 'app-client-detail',
  templateUrl: './client-detail.component.html',
  styleUrls: ['./client-detail.component.scss'],
})
export class ClientDetailComponent implements OnInit {

  @ViewChild(InfoBuilderComponent) child: InfoBuilderComponent<Client>;
  public infoDataSource: InfoDataSource<Client>;
  public tableDataSource: TableDataSource<Job>;

  public buttons: CustomButton[]  = [
    {
      name: 'Bearbeiten',
      navigate:   (): void => {
        this.child.editButtonClicked();
      }
    },
    {
      name:  'Neuer Auftrag',
      navigate:   (): void => {
        this.router.navigateByUrl('/job/edit/new/' + this.id.toString());
      }
    }
  ];

  private id: number;

  constructor(private api: DefaultService, private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.id = parseInt(params.id, 10);
      if (isNaN(this.id)) {
        console.error('Cannot parse given id');
        this.router.navigate(['client']);
        return;
      }
      this.infoDataSource = new InfoDataSource<Client>(
        this.api.readClientClientClientIdGet(this.id),
        [
          {
            property: 'name',
            name: 'Name'
          },
          {
            property: 'lastname',
            name: 'Nachname'
          },
          {
            property: 'mail1',
            name: 'Mail'
          },
          {
            property: 'mail2',
            name: 'Mail'
          }
        ],
        '/client/edit/' + this.id.toString(),
        this.api.islockedClientClientIslockedClientIdGet(this.id),
        this.api.lockClientClientLockClientIdPost(this.id),
        this.api.unlockClientClientUnlockClientIdPost(this.id)
      );
      this.tableDataSource = new TableDataSource(
        this.api,
        (api, filter, sortDirection, skip, limit) => api.readJobsByClientJobClientClientIdGet(this.id, filter, skip, limit),
        (dataSourceClasses) => {
          const rows = [];
          dataSourceClasses.forEach((dataSource) => {
            rows.push(
              {
                values: {
                  id: dataSource.id,
                  'orderable.name': dataSource.orderable.name,
                  description: dataSource.description
                },
                route: () => {
                  this.router.navigateByUrl('/job/' + dataSource.id.toString());
                }
              });
          });
          return rows;
        },
        [
          {name: 'id', headerName: 'ID'},
          {name: 'orderable.name', headerName: 'Name'},
          {name: 'description', headerName: 'Beschreibung'}
        ],
        (api) => api.readJobsByClientJobClientClientIdCountGet(this.id)
      );
      this.tableDataSource.loadData();
    });
  }
}
