import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

import { provideRouter, RouteReuseStrategy } from '@angular/router';
import { routes } from './app/app.routes';
import { CustomReuseStrategy } from './app/reuseables/custom-reuse-strategy';
import { PostHttpInterceptor } from './app/reuseables/http-loader/post-http.interceptor';
import { provideHttpClient, withInterceptors } from '@angular/common/http';


bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    provideRouter(routes),
    // { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },

    // ✅ Needed for NgOptimizedImage
    // provideHttpClient(),
    provideHttpClient(withInterceptors([PostHttpInterceptor]))


    // ✅ Register NgOptimizedImage
    // importProvidersFrom(NgOptimizedImage),

    // CurrencyConverterPipe,

    // 🔥 Service Worker
    // provideServiceWorker('combined-sw.js', {
    //   enabled: !isDevMode(),
    //   registrationStrategy: 'registerWhenStable:30000',
    // }),
    // ✅ Register combined service worker manually


  ]
}).catch((err) => console.error(err));
