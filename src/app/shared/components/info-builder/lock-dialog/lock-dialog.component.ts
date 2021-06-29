import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Lock} from "eisenstecken-openapi-angular-library";

export interface LockDialogData {
  lock: Lock;
  unlockFunction: VoidFunction;
}


@Component({
  selector: 'app-lock-dialog',
  templateUrl: './lock-dialog.component.html',
  styleUrls: ['./lock-dialog.component.scss']
})

export class LockDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<LockDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: LockDialogData) { }

  ngOnInit(): void {
  }

  onCancelClick() :void {
    this.dialogRef.close();
  }

  onUnlockClick() :void {
    this.data.unlockFunction();
    this.dialogRef.close();
  }
}
