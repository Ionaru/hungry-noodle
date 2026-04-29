import { provideZonelessChangeDetection } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import {
  ActivatedRoute,
  convertToParamMap,
  ParamMap,
  provideRouter,
} from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { PERSISTANT_STORAGE } from "../../../app.tokens";
import { AudioService } from "../../../audio/audio.service";
import { GameState } from "../../../services/game-state";
import { Progression } from "../../../services/progression";
import { WebPersistantStorage } from "../../../services/storage/web-persistant-storage";
import { SNAKE_TYPES } from "../../../snake/snake-types";

import { SnakeSelect } from "./snake-select";

describe("SnakeSelect", () => {
  let fixture: ComponentFixture<SnakeSelect>;
  let component: SnakeSelect;
  let queryParamMap: BehaviorSubject<ParamMap>;
  let progression: Progression;
  let gameState: GameState;

  function createFixture(): void {
    fixture = TestBed.createComponent(SnakeSelect);
    component = fixture.componentInstance;
    progression = TestBed.inject(Progression);
    gameState = TestBed.inject(GameState);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    queryParamMap = new BehaviorSubject<ParamMap>(convertToParamMap({}));

    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: PERSISTANT_STORAGE, useClass: WebPersistantStorage },
        {
          provide: AudioService,
          useValue: { init: vi.fn(), playSfx: vi.fn() },
        },
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: queryParamMap.asObservable() },
        },
      ],
    }).compileComponents();
  });

  test("renders all six snake type cards by default", () => {
    createFixture();
    expect(component.visibleTypes().length).toBe(SNAKE_TYPES.length);
    expect(component.visibleTypes().map((s) => s.id)).toEqual(
      SNAKE_TYPES.map((s) => s.id),
    );
  });

  test("isUnlocked reflects Progression.unlockedSnakeTypes", () => {
    createFixture();
    expect(component.isUnlocked("friendly")).toBe(true);
    expect(component.isUnlocked("ghost")).toBe(false);
    progression.unlockSnakeType("ghost");
    expect(component.isUnlocked("ghost")).toBe(true);
  });

  test("?available query param filters visible cards", () => {
    queryParamMap.next(convertToParamMap({ available: "friendly,ghost" }));
    createFixture();
    expect(component.visibleTypes().map((s) => s.id)).toEqual([
      "friendly",
      "ghost",
    ]);
  });

  test("?recommended query param marks the matching card", () => {
    queryParamMap.next(convertToParamMap({ recommended: "lucky" }));
    createFixture();
    expect(component.recommendedId()).toBe("lucky");
    expect(component.isRecommended("lucky")).toBe(true);
    expect(component.isRecommended("friendly")).toBe(false);
  });

  test("active card persists into GameState.selectedSnakeType", async () => {
    createFixture();
    progression.unlockSnakeType("speedy");
    const speedyIndex = component
      .visibleTypes()
      .findIndex((s) => s.id === "speedy");
    component.activeIndex.set(speedyIndex);
    await fixture.whenStable();
    expect(gameState.selectedSnakeType()).toBe("speedy");
  });

  test("isActiveLocked is true when the active card is not unlocked", () => {
    createFixture();
    const ghostIndex = component
      .visibleTypes()
      .findIndex((s) => s.id === "ghost");
    component.activeIndex.set(ghostIndex);
    fixture.detectChanges();
    expect(component.isActiveLocked()).toBe(true);
  });
});
