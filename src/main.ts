import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { AppConfig } from './environments/environment';
import * as Sentry from "@sentry/angular";
import {Integrations} from "@sentry/tracing";

Sentry.init({
  dsn: "https://739b39d0b92749a485e48a80da87816e@sentry.kivi.bz.it/26",
  integrations: [
    new Integrations.BrowserTracing({
      tracingOrigins: ["localhost", "https://yourserver.io/api"],
      routingInstrumentation: Sentry.routingInstrumentation,
    }),
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});


platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .then(success => console.log(`Bootstrap success`))
  .catch(err => console.error(err));

if (AppConfig.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule, {
    preserveWhitespaces: true //TODO: decide if we should change this to false
  })
  .catch(err => console.error(err));
