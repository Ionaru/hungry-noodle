import { Component, input, output } from "@angular/core";
import { faAngleLeft } from "@awesome.me/kit-fa99832706/icons/slab/regular";
import { FaIconComponent } from "@fortawesome/angular-fontawesome";

@Component({
  selector: "app-back-button",
  imports: [FaIconComponent],
  template: `
    <button
      type="button"
      (click)="clicked.emit()"
      [attr.aria-label]="ariaLabel()"
      class="flex h-10 w-10 items-center justify-center rounded-full bg-white/30 text-xl font-bold text-black backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-white/50 active:scale-95"
    >
      <fa-icon [icon]="faAngleLeft" />
    </button>
  `,
})
export class BackButton {
  readonly ariaLabel = input<string>("Back");
  readonly clicked = output();
  protected readonly faAngleLeft = faAngleLeft;
}
