import { provideZonelessChangeDetection } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { describe, test, expect, beforeEach, vi } from "vitest";

import { BackButton } from "./back-button";

describe("BackButton", () => {
  let fixture: ComponentFixture<BackButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(BackButton);
  });

  test("renders default aria-label when none provided", () => {
    fixture.detectChanges();

    const button = (fixture.nativeElement as HTMLElement).querySelector(
      "button",
    );
    expect(button?.getAttribute("aria-label")).toBe("Back");
  });

  test("renders provided aria-label", () => {
    fixture.componentRef.setInput("ariaLabel", "Back to menu");
    fixture.detectChanges();

    const button = (fixture.nativeElement as HTMLElement).querySelector(
      'button[aria-label="Back to menu"]',
    );
    expect(button).not.toBeNull();
  });

  test("emits clicked when pressed", () => {
    const handler = vi.fn();
    fixture.componentRef.instance.clicked.subscribe(handler);
    fixture.detectChanges();

    const button = (fixture.nativeElement as HTMLElement).querySelector(
      "button",
    );
    button?.click();

    expect(handler).toHaveBeenCalledTimes(1);
  });
});
