import { Component } from "@angular/core";

@Component({
  selector: "app-safe-container",
  template: `<ng-content />`,
  host: {
    class:
      "safe-area-top safe-area-bottom safe-area-left safe-area-right h-full w-full",
  },
})
export class SafeContainer {}
