import { computed, signal } from "@angular/core";

import { SnakeSegment } from "./types";

export class Snake {
  readonly segments = signal<SnakeSegment[]>([]);

  readonly length = computed<number>(() => this.segments().length);

  readonly occupiedTiles = computed<Set<`${string},${string}`>>(() => {
    const length = this.length();
    const segments = this.segments();
    const occupiedTiles = new Set<`${string},${string}`>();
    if (length > 2) {
      for (let index = 1; index < length - 1; index++) {
        const segment = segments[index];
        const segmentX = Math.floor(segment.x);
        const segmentY = Math.floor(segment.y);
        occupiedTiles.add(`${segmentX.toString()},${segmentY.toString()}`);
        const segmentXNext = Math.ceil(segment.x);
        const segmentYNext = Math.ceil(segment.y);
        occupiedTiles.add(
          `${segmentXNext.toString()},${segmentYNext.toString()}`,
        );
      }
    }
    return occupiedTiles;
  });
}
