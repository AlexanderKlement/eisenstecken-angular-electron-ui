import { Component, OnInit } from '@angular/core';
import {Client, DefaultService} from "eisenstecken-openapi-angular-library";
import {InfoDataSource} from "../../shared/components/info-builder/info-builder.datasource";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-client-detail',
  templateUrl: './client-detail.component.html',
  styleUrls: ['./client-detail.component.scss']
})
export class ClientDetailComponent implements OnInit {

  public dataSource: InfoDataSource<Client>;
  constructor(private api: DefaultService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.params.subscribe( (params) => {
      let id: number;
      try{
        id = parseInt(params.id);
      } catch {
        console.log("Cannot parse given id");
        this.router.navigate(['client']);
        return;
      }
      this.dataSource = new InfoDataSource<Client>(
        this.api.readClientClientClientIdGet(id),
        [
          {
            property: "name",
            name: "Name"
          },
          {
            property: "lastname",
            name: "Nachname"
          },
          {
            property: "mail1",
            name: "Mail"
          },
          {
            property: "mail2",
            name: "Mail"
          }
        ],
        2
      );
    });
  }

}
