import { Component, input } from "@angular/core";

@Component({
  selector: "app-stat-card",
  template: `
    <div class="text-3xl font-bold">{{ value() }}</div>
    <div class="mt-1 text-sm opacity-75">{{ label() }}</div>
  `,
  host: {
    class:
      "flex flex-col items-center rounded-2xl bg-white/20 p-4 text-center backdrop-blur-sm",
    "[class.col-span-2]": "highlight()",
  },
})
export class StatCard {
  readonly value = input.required<string | number>();
  readonly label = input.required<string>();
  readonly highlight = input(false);
}
