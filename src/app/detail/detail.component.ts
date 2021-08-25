import { Component, OnInit } from '@angular/core';
import {DefaultService, Unit} from "eisenstecken-openapi-angular-library";
import {Observable} from "rxjs";

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

  constructor(private api: DefaultService) { }

  units$:Observable<Unit[]>;

  ngOnInit(): void {
    this.units$ = this.api.readUnitsUnitGet();
    this.units$.subscribe((units) => {
      console.log(units);
    });
  }

}
