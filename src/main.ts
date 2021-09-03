import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { AppConfig } from './environments/environment';
import * as Sentry from "@sentry/electron";


if(AppConfig.environment != "WEB") {
  //Sentry.init({ dsn: "https://examplePublicKey@o0.ingest.sentry.io/0" });
}

if (AppConfig.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule, {
    preserveWhitespaces: false
  })
  .catch(err => console.error(err));
