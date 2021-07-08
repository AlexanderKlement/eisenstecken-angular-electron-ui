import {Component, Input, OnInit} from '@angular/core';
import {InfoDataSource} from "./info-builder.datasource";
import {DataSourceClass} from "../../types";
import {MatDialog} from "@angular/material/dialog";
import {LockDialogComponent} from "./lock-dialog/lock-dialog.component";
import {Lock} from "eisenstecken-openapi-angular-library";
import {first} from "rxjs/operators";

@Component({
  selector: 'app-info-builder',
  templateUrl: './info-builder.component.html',
  styleUrls: ['./info-builder.component.scss']
})

export class InfoBuilderComponent<T extends DataSourceClass> implements OnInit {

  @Input() dataSource: InfoDataSource<T>;

  constructor(public dialog: MatDialog) {}

  ngOnInit(): void {}

  getPropertyOfObject(data: T, property: string): string{
    const propertyArray = property.split(".");
    for(let i = 0; i < propertyArray.length; i++){
      data = data[propertyArray[i]];
    }
    return data.toString();
  }

  editButtonClicked() :void{
    const lock = this.dataSource.islockedFunction();
    lock.pipe(first()).subscribe((lock) => {
      if(lock.locked){
        this.dataSource.user$.pipe(first()).subscribe((user) => {
          if(user.id == lock.user.id){
            this.lockAndNavigate();
          } else {
            this.showLockDialog(lock);
          }
        });
      }
      else {
        this.lockAndNavigate();
      }
    });
  }

  showLockDialog(lock: Lock): void {
    this.dialog.open(LockDialogComponent, {
      data: {
        lock: lock,
        unlockFunction: this.dataSource.unlockFunction
      }
    });
  }

  lockAndNavigate(): void {
    this.dataSource.lockFunction(this.dataSource.editButtonFunction);
  }
}
