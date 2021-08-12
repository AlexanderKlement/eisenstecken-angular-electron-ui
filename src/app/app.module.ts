import { BrowserModule } from '@angular/platform-browser';
import {APP_INITIALIZER, ErrorHandler, NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { AppRoutingModule } from './app-routing.module';
// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ApiModule, Configuration, ConfigurationParameters} from 'eisenstecken-openapi-angular-library';
import { HomeModule } from './home/home.module';
import { DetailModule } from './detail/detail.module';
import { AppConfig } from 'environments/environment';

import { AppComponent } from './app.component';
import { AuthService } from "./shared/auth.service";
import { AccessGuard } from "./shared/access-guard.service";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MatCheckboxModule} from '@angular/material/checkbox';
import {FlexLayoutModule} from "@angular/flex-layout";
import {ChatService} from "./home/chat/chat.service";
import {MatInputModule} from "@angular/material/input";
import {MatTableModule} from "@angular/material/table";
import {MatPaginatorModule} from "@angular/material/paginator";
import {MatSortModule} from "@angular/material/sort";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {JobModule} from "./job/job.module";
import {MatSelectModule} from "@angular/material/select";
import {MatButtonModule} from "@angular/material/button";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MAT_DATE_LOCALE, MatNativeDateModule} from "@angular/material/core";
import {DatePipe} from "@angular/common";
import {NgxMatMomentModule} from "@angular-material-components/moment-adapter";
import {SettingsModule} from "./settings/settings.module";
import {OrderModule} from "./order/order.module";
import {LogService} from "./shared/log.service";
import { Router } from "@angular/router";
import * as Sentry from "@sentry/angular";
// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function apiConfigFactory (): Configuration {
  const params: ConfigurationParameters = {
    basePath: AppConfig.API_BASE_PATH,
  };
  return new Configuration(params);
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    CoreModule,
    SharedModule,
    HomeModule,
    DetailModule,
    JobModule,
    SettingsModule,
    OrderModule,
    ApiModule.forRoot(apiConfigFactory),
    AppRoutingModule,
    FlexLayoutModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatCheckboxModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatButtonModule,
    MatToolbarModule,
    MatNativeDateModule,
    NgxMatMomentModule
  ],
  providers:
    [
      {
        provide: Configuration,
        useFactory: (authService: AuthService) => new Configuration(
          {
            accessToken: authService.getToken.bind(authService),
            basePath: AppConfig.API_BASE_PATH,
          }
        ),
        deps: [AuthService],
        multi: false
      },
      AccessGuard,
      ChatService,
      DatePipe,
      {
        provide: MAT_DATE_LOCALE, useValue: 'de-DE'
      },
      {
        provide: ErrorHandler,
        useValue: Sentry.createErrorHandler({
          showDialog: true,
        }),
      },
      {
        provide: Sentry.TraceService,
        deps: [Router],
      },
      {
        provide: APP_INITIALIZER,
        useFactory: () => () => {},
        deps: [Sentry.TraceService],
        multi: true,
      },
    ],
  bootstrap: [AppComponent]
})
export class AppModule {}
