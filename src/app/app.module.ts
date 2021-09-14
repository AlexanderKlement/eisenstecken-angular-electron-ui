import { BrowserModule } from '@angular/platform-browser';
import {APP_INITIALIZER, ErrorHandler, LOCALE_ID, NgModule} from '@angular/core';
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
import { APP_CONFIG } from 'environments/environment';

import { AppComponent } from './app.component';
import { AuthService } from './shared/auth.service';
import { AccessGuard } from './shared/access-guard.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {FlexLayoutModule} from '@angular/flex-layout';
import {ChatService} from './home/chat/chat.service';
import {MatInputModule} from '@angular/material/input';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatSortModule} from '@angular/material/sort';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {JobModule} from './job/job.module';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MAT_DATE_LOCALE, MatNativeDateModule} from '@angular/material/core';
import {DatePipe, registerLocaleData} from '@angular/common';
import {NgxMatMomentModule} from '@angular-material-components/moment-adapter';
import {SettingsModule} from './settings/settings.module';
import {OrderModule} from './order/order.module';
import {LoginModule} from './login/login.module';
import { Router } from '@angular/router';
import localeDe from '@angular/common/locales/de';
import localeDeExtra from '@angular/common/locales/extra/de';
import * as Sentry from '@sentry/angular';
import {ClientModule} from './client/client.module';
import {UserModule} from './user/user.module';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {InvoiceModule} from './invoice/invoice.module';
// AoT requires an exported function for factories
const httpLoaderFactory = (http: HttpClient): TranslateHttpLoader =>  new TranslateHttpLoader(http, './assets/i18n/', '.json');

registerLocaleData(localeDe, 'de-DE', localeDeExtra);

export function apiConfigFactory(): Configuration {
  const params: ConfigurationParameters = {
    basePath: APP_CONFIG.apiBasePath,
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
    ClientModule,
    UserModule,
    SettingsModule,
    OrderModule,
    LoginModule,
    InvoiceModule,
    ApiModule.forRoot(apiConfigFactory),
    AppRoutingModule,
    FlexLayoutModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpLoaderFactory,
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
    NgxMatMomentModule,
    MatSnackBarModule
  ],
  providers:
    [{
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
    {
      provide: Configuration,
      useFactory: (authService: AuthService) => new Configuration(
        {
          accessToken: authService.getToken.bind(authService),
          basePath: APP_CONFIG.apiBasePath,
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
      provide: LOCALE_ID,
      useValue: 'de-DE' // 'de-DE' for Germany, 'fr-FR' for France ...
    },
    ],
  bootstrap: [AppComponent]
})
export class AppModule {}
