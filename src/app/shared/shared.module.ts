import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';

import { PageNotFoundComponent } from './components/';
import { WebviewDirective } from './directives/';
import { FormsModule } from '@angular/forms';
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

@NgModule({
  declarations: [PageNotFoundComponent, WebviewDirective, TestComponent, TableBuilderComponent, InfoBuilderComponent],
  imports: [CommonModule, TranslateModule, FormsModule, MatCheckboxModule, MatTableModule, MatProgressSpinnerModule, MatPaginatorModule, MatInputModule, MatGridListModule, MatListModule],
  exports: [TranslateModule, WebviewDirective, FormsModule, TestComponent, TableBuilderComponent, InfoBuilderComponent]
})
export class SharedModule {}
