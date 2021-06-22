import { Component, OnInit } from '@angular/core';
import { DefaultService } from "eisenstecken-openapi-angular-library";

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {

  units$ = this.api.readUnitsUnitGet();

  constructor(private api: DefaultService) {
  }

  ngOnInit(): void {
  }

}
