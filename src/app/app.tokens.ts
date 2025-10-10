import { InjectionToken } from "@angular/core";

import { PersistantStorage } from "./services/storage/persistant-storage";

export const PERSISTANT_STORAGE = new InjectionToken<PersistantStorage>(
  "PersistantStorage",
);
