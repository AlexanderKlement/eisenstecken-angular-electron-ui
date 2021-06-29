import {Component, Input, OnInit} from '@angular/core';
import {InfoDataSource} from "./info-builder.datasource";
import {DataSourceClass} from "../../types";

@Component({
  selector: 'app-info-builder',
  templateUrl: './info-builder.component.html',
  styleUrls: ['./info-builder.component.scss']
})

export class InfoBuilderComponent<T extends DataSourceClass> implements OnInit {

  @Input() dataSource: InfoDataSource<T>;

  constructor() { }

  ngOnInit(): void {
  }

  getPropertyOfObject(data: T, property: string): string{
    const propertyArray = property.split(".");
    for(let i = 0; i < propertyArray.length; i++){
      data = data[propertyArray[i]];
    }
    return data.toString();
  }

  editButtonClicked() :void{
    this.dataSource.editButtonFunction();
  }
}
