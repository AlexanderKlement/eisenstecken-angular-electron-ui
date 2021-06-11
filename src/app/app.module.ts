import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
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
import { LoginComponent } from './login/login.component';
import { AuthService } from "./shared/auth.service";

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
  declarations: [AppComponent, LoginComponent],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    CoreModule,
    SharedModule,
    HomeModule,
    DetailModule,
    AppRoutingModule,
    ApiModule.forRoot(apiConfigFactory),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    ReactiveFormsModule
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
      }
    ],
  bootstrap: [AppComponent]
})
export class AppModule {}
