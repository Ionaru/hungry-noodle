import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: "",
    redirectTo: "/menu",
    pathMatch: "full",
  },
  {
    path: "menu",
    loadComponent: () =>
      import("./components/main-menu/main-menu").then((m) => m.MainMenu),
  },
  {
    path: "play",
    loadComponent: () => import("./components/play/play").then((m) => m.Play),
  },
  // Placeholder routes for future implementation
  {
    path: "progression",
    loadComponent: () =>
      import("./components/main-menu/main-menu").then((m) => m.MainMenu), // Temporary redirect
  },
  {
    path: "shop",
    loadComponent: () =>
      import("./components/main-menu/main-menu").then((m) => m.MainMenu), // Temporary redirect
  },
  {
    path: "challenges",
    loadComponent: () =>
      import("./components/main-menu/main-menu").then((m) => m.MainMenu), // Temporary redirect
  },
  {
    path: "settings",
    loadComponent: () =>
      import("./components/main-menu/main-menu").then((m) => m.MainMenu), // Temporary redirect
  },
  {
    path: "**",
    redirectTo: "/menu",
  },
];
