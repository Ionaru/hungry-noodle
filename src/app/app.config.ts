import { provideHttpClient, withFetch } from "@angular/common/http";
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from "@angular/core";
import {
  provideRouter,
  withComponentInputBinding,
  withViewTransitions,
} from "@angular/router";

import { routes } from "./app.routes";
import { PERSISTANT_STORAGE } from "./app.tokens";
import { TauriPersistantStorage } from "./services/storage/tauri-persistant-storage";
import { WebPersistantStorage } from "./services/storage/web-persistant-storage";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    provideHttpClient(withFetch()),
    {
      provide: PERSISTANT_STORAGE,
      useClass: '__TAURI_INTERNALS__' in globalThis ? TauriPersistantStorage : WebPersistantStorage,
    },
  ],
};
