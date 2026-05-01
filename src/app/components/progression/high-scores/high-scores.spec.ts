import {
  provideZonelessChangeDetection,
  signal,
  WritableSignal,
} from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { describe, test, expect, beforeEach, vi } from "vitest";

import { AudioService } from "../../../audio/audio.service";
import { PlayerStats, Progression } from "../../../services/progression";

import { HighScores } from "./high-scores";

const emptyStats: PlayerStats = {
  gamesPlayed: 0,
  totalScore: 0,
  highScore: 0,
  totalLength: 0,
  longestSnake: 0,
  playTime: 0,
};

describe("HighScores", () => {
  let fixture: ComponentFixture<HighScores>;
  let component: HighScores;
  let playerStats: WritableSignal<PlayerStats>;
  let routerNavigate: ReturnType<typeof vi.fn>;
  let audioPlaySfx: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    playerStats = signal<PlayerStats>(emptyStats);
    routerNavigate = vi.fn().mockResolvedValue(true);
    audioPlaySfx = vi.fn();

    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: Progression, useValue: { playerStats } },
        { provide: AudioService, useValue: { playSfx: audioPlaySfx } },
        { provide: Router, useValue: { navigate: routerNavigate } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HighScores);
    component = fixture.componentInstance;
  });

  test("creates the component", () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  test("renders empty state when no games have been played", () => {
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent;
    expect(text).toContain("Play your first game");
    expect(text).not.toContain("Best Score");
  });

  test("renders all stats when populated", () => {
    playerStats.set({
      gamesPlayed: 7,
      totalScore: 420,
      highScore: 99,
      totalLength: 130,
      longestSnake: 42,
      playTime: 3725,
    });

    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent;
    expect(text).toContain("Best Score");
    expect(text).toContain("99");
    expect(text).toContain("Longest Snake");
    expect(text).toContain("42");
    expect(text).toContain("Games Played");
    expect(text).toContain("7");
    expect(text).toContain("Play Time");
    expect(text).toContain("1h 2m");
    expect(text).toContain("Total Length");
    expect(text).toContain("130");
    expect(text).not.toContain("Play your first game");
  });

  test("back button navigates to /menu and plays click sfx", () => {
    playerStats.set({
      gamesPlayed: 1,
      totalScore: 10,
      highScore: 10,
      totalLength: 5,
      longestSnake: 5,
      playTime: 30,
    });

    fixture.detectChanges();

    const button = (fixture.nativeElement as HTMLElement).querySelector(
      'button[aria-label="Back to menu"]',
    );
    expect(button).not.toBeNull();
    (button as HTMLButtonElement | null)?.click();

    expect(audioPlaySfx).toHaveBeenCalled();
    expect(routerNavigate).toHaveBeenCalledWith(["/menu"]);
  });
});
