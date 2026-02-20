import { provideZonelessChangeDetection } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { describe, test, expect, beforeEach, vi } from "vitest";

import { App } from "./app";
import { PERSISTANT_STORAGE } from "./app.tokens";
import { AudioService } from "./audio/audio.service";
import { WebPersistantStorage } from "./services/storage/web-persistant-storage";

describe("App", () => {
  let component: App;
  let fixture: ComponentFixture<App>;
  let mockAudioService: Pick<AudioService, "init">;

  beforeEach(async () => {
    mockAudioService = {
      init: vi.fn().mockReturnValue(Promise.resolve()),
    };

    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: PERSISTANT_STORAGE,
          useClass: WebPersistantStorage,
        },
        {
          provide: AudioService,
          useValue: mockAudioService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  test("should create the app", () => {
    expect(component).toBeTruthy();
  });
});
