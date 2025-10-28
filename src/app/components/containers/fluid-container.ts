import { Component } from "@angular/core";

@Component({
  selector: "app-fluid-container",
  template: `
    <div class="fluid-width fluid-height">
      <ng-content />
    </div>
  `,
  host: {
    class: "block h-screen w-screen",
  },
})
export class FluidContainer {}
