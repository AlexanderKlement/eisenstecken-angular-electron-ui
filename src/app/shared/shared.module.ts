import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';

import { PageNotFoundComponent } from './components/';
import { WebviewDirective } from './directives/';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TestComponent} from "./components/test/test.component";
import {MatCheckboxModule} from "@angular/material/checkbox";
import { TableBuilderComponent } from './components/table-builder/table-builder.component';
import {MatTableModule} from "@angular/material/table";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatPaginatorModule} from "@angular/material/paginator";
import {MatInputModule} from "@angular/material/input";
import { InfoBuilderComponent } from './components/info-builder/info-builder.component';
import {MatGridListModule} from "@angular/material/grid-list";
import {MatListModule} from "@angular/material/list";
import {MatButtonModule} from "@angular/material/button";
import { LockDialogComponent } from './components/info-builder/lock-dialog/lock-dialog.component';
import {MatDialogModule} from "@angular/material/dialog";
import { BaseEditComponent } from './components/base-edit/base-edit.component';
import { WarningDialogComponent } from './components/base-edit/warning-dialog/warning-dialog.component';
import { AddressFormComponent } from './components/address-form/address-form.component';
import {FlexModule} from "@angular/flex-layout";
import {MatSelectModule} from "@angular/material/select";

@NgModule({
  declarations: [PageNotFoundComponent, WebviewDirective, TestComponent, TableBuilderComponent, InfoBuilderComponent, LockDialogComponent, BaseEditComponent, WarningDialogComponent, AddressFormComponent],
  imports: [CommonModule, TranslateModule, FormsModule, MatCheckboxModule, MatTableModule, MatProgressSpinnerModule, MatPaginatorModule, MatInputModule, MatGridListModule, MatListModule, MatButtonModule, MatDialogModule, ReactiveFormsModule, FlexModule, MatSelectModule],
  exports: [TranslateModule, WebviewDirective, FormsModule, TestComponent, TableBuilderComponent, InfoBuilderComponent, AddressFormComponent]
})
export class SharedModule {}
