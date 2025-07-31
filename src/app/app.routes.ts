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
      import("./components/main-menu/main-menu.component").then(
        (m) => m.MainMenuComponent,
      ),
  },
  {
    path: "play",
    loadComponent: () =>
      import("./components/play/play.component").then((m) => m.PlayComponent),
  },
  // Placeholder routes for future implementation
  {
    path: "progression",
    loadComponent: () =>
      import("./components/main-menu/main-menu.component").then(
        (m) => m.MainMenuComponent,
      ), // Temporary redirect
  },
  {
    path: "shop",
    loadComponent: () =>
      import("./components/main-menu/main-menu.component").then(
        (m) => m.MainMenuComponent,
      ), // Temporary redirect
  },
  {
    path: "challenges",
    loadComponent: () =>
      import("./components/main-menu/main-menu.component").then(
        (m) => m.MainMenuComponent,
      ), // Temporary redirect
  },
  {
    path: "settings",
    loadComponent: () =>
      import("./components/main-menu/main-menu.component").then(
        (m) => m.MainMenuComponent,
      ), // Temporary redirect
  },
  {
    path: "**",
    redirectTo: "/menu",
  },
];
