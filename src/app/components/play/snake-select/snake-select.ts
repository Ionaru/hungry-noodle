import {
  AfterViewInit,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  untracked,
  viewChild,
  viewChildren,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router } from "@angular/router";
import {
  faChevronLeft,
  faLock,
  faPlay,
  faStar,
} from "@awesome.me/kit-fa99832706/icons/slab/regular";
import { FaIconComponent } from "@fortawesome/angular-fontawesome";

import { AudioService } from "../../../audio/audio.service";
import { SfxType } from "../../../audio/sfx";
import { GameState } from "../../../services/game-state";
import { Progression } from "../../../services/progression";
import {
  SNAKE_TYPES,
  SnakeTypeId,
  SnakeTypeInfo,
} from "../../../snake/snake-types";
import { FluidContainer } from "../../containers/fluid-container";

@Component({
  selector: "app-snake-select",
  templateUrl: "./snake-select.html",
  imports: [FaIconComponent, FluidContainer],
})
export class SnakeSelect implements AfterViewInit, OnDestroy {
  readonly #router = inject(Router);
  readonly #route = inject(ActivatedRoute);
  readonly #progression = inject(Progression);
  readonly #gameState = inject(GameState);
  readonly #audio = inject(AudioService);
  readonly #destroyRef = inject(DestroyRef);

  readonly carousel =
    viewChild.required<ElementRef<HTMLDivElement>>("carousel");
  readonly cards = viewChildren<ElementRef<HTMLElement>>("card");

  readonly iconBack = faChevronLeft;
  readonly iconLock = faLock;
  readonly iconStart = faPlay;
  readonly iconRecommended = faStar;

  readonly #queryAvailable = signal<readonly SnakeTypeId[] | null>(null);
  readonly #queryRecommended = signal<SnakeTypeId | null>(null);

  readonly visibleTypes = computed<readonly SnakeTypeInfo[]>(() => {
    const allowed = this.#queryAvailable();
    if (!allowed || allowed.length === 0) {
      return SNAKE_TYPES;
    }
    return SNAKE_TYPES.filter((snake) => allowed.includes(snake.id));
  });

  readonly recommendedId = computed<SnakeTypeId | null>(() => {
    const requested = this.#queryRecommended();
    if (requested && this.visibleTypes().some((s) => s.id === requested)) {
      return requested;
    }
    return null;
  });

  readonly activeIndex = signal(0);

  readonly activeType = computed<SnakeTypeInfo | null>(() => {
    const list = this.visibleTypes();
    if (list.length === 0) return null;
    const index = Math.min(this.activeIndex(), list.length - 1);
    return list[index];
  });

  readonly isActiveLocked = computed(() => {
    const active = this.activeType();
    if (!active) return true;
    return !this.isUnlocked(active.id);
  });

  #observer: IntersectionObserver | null = null;
  #initialized = false;

  constructor() {
    this.#route.queryParamMap
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((params) => {
        const availableParam = params.get("available");
        if (availableParam) {
          const ids = availableParam
            .split(",")
            .map((id) => id.trim())
            .filter((id): id is SnakeTypeId =>
              SNAKE_TYPES.some((snake) => snake.id === id),
            );
          this.#queryAvailable.set(ids.length > 0 ? ids : null);
        } else {
          this.#queryAvailable.set(null);
        }

        const recommendedParam = params.get("recommended");
        if (
          recommendedParam &&
          SNAKE_TYPES.some((snake) => snake.id === recommendedParam)
        ) {
          this.#queryRecommended.set(recommendedParam as SnakeTypeId);
        } else {
          this.#queryRecommended.set(null);
        }

        this.#applyInitialActiveIndex();
      });

    // Persist selection into GameState whenever the active card changes.
    effect(() => {
      const active = this.activeType();
      if (!active) return;
      untracked(() => {
        if (this.#gameState.selectedSnakeType() !== active.id) {
          this.#gameState.selectedSnakeType.set(active.id);
        }
      });
    });
  }

  ngAfterViewInit(): void {
    const cardElements = this.cards().map((ref) => ref.nativeElement);
    if (cardElements.length === 0) return;

    // Snap the carousel to the chosen card now that DOM is ready.
    this.scrollToIndex(this.activeIndex(), false);

    this.#observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (intersecting.length === 0) return;
        const target = intersecting[0].target;
        const index = cardElements.indexOf(target as HTMLElement);
        if (index >= 0) {
          this.activeIndex.set(index);
        }
      },
      {
        root: this.carousel().nativeElement,
        threshold: 0.6,
      },
    );

    for (const element of cardElements) {
      this.#observer.observe(element);
    }
  }

  ngOnDestroy(): void {
    this.#observer?.disconnect();
    this.#observer = null;
  }

  isUnlocked(id: SnakeTypeId): boolean {
    return this.#progression.unlockedSnakeTypes().includes(id);
  }

  isRecommended(id: SnakeTypeId): boolean {
    return this.recommendedId() === id;
  }

  scrollToIndex(index: number, smooth = true): void {
    const cards = this.cards();
    if (index < 0 || index >= cards.length) return;
    cards[index].nativeElement.scrollIntoView({
      behavior: smooth ? "smooth" : "instant",
      block: "nearest",
      inline: "center",
    });
  }

  start(): void {
    const active = this.activeType();
    if (!active || !this.isUnlocked(active.id)) return;
    this.#gameState.selectedSnakeType.set(active.id);
    this.#audio.playSfx(SfxType.UiClick);
    void this.#router.navigate(["/play"]);
  }

  back(): void {
    this.#audio.playSfx(SfxType.UiClick);
    void this.#router.navigate(["/menu"]);
  }

  // Choose the initial active card once: recommended → currently selected → first unlocked → first.
  #applyInitialActiveIndex(): void {
    if (this.#initialized) return;
    const list = this.visibleTypes();
    if (list.length === 0) return;
    this.#initialized = true;

    const recommended = this.recommendedId();
    const current = this.#gameState.selectedSnakeType();
    const preferredId =
      recommended ??
      (list.some((s) => s.id === current) ? current : null) ??
      list.find((s) => this.isUnlocked(s.id))?.id ??
      list[0].id;

    const preferredIndex = list.findIndex((s) => s.id === preferredId);
    if (preferredIndex >= 0) {
      this.activeIndex.set(preferredIndex);
    }
  }
}
