import { Component } from "@angular/core";

@Component({
  selector: "app-safe-container",
  template: `<ng-content />`,
  host: {
    class: "block safe-height safe-width",
  },
})
export class SafeContainer {}
