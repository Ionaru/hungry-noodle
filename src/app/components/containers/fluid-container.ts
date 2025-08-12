import { Component } from "@angular/core";

@Component({
  selector: "app-fluid-container",
  template: `
    <div class="h-full w-full">
      <ng-content />
    </div>
  `,
})
export class FluidContainer {}
