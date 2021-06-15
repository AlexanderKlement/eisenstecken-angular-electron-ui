import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';

import { PageNotFoundComponent } from './components/';
import { WebviewDirective } from './directives/';
import { FormsModule } from '@angular/forms';
import {TestComponent} from "./components/test/test.component";
import {MatCheckboxModule} from "@angular/material/checkbox";

@NgModule({
  declarations: [PageNotFoundComponent, WebviewDirective, TestComponent],
    imports: [CommonModule, TranslateModule, FormsModule, MatCheckboxModule],
  exports: [TranslateModule, WebviewDirective, FormsModule, TestComponent]
})
export class SharedModule {}
