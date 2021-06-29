import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

export interface WarningDialogData {
  totalBlockingTime: number;
  remainingBlockingTime: number;
}

@Component({
  selector: 'app-warning-dialog',
  templateUrl: './warning-dialog.component.html',
  styleUrls: ['./warning-dialog.component.scss']
})
export class WarningDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<WarningDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: WarningDialogData) { }

  ngOnInit(): void {
  }

  onAcceptClick() :void {
    this.dialogRef.close();
  }

}
