import { Injectable, computed, signal } from "@angular/core";

import { MapGenerator } from "./generator";
import { TerrainType, type MapConfig, type MapData } from "./types";

@Injectable({ providedIn: "root" })
export class MapState {
  readonly #mapData = signal<MapData | null>(null);

  readonly mapData = computed(() => {
    const data = this.#mapData();
    if (!data) {
      // Provide a minimal default to avoid null checks during boot
      return MapGenerator.generate({
        width: 80,
        height: 120,
        gridSize: 16,
        terrainType: TerrainType.GRASSLANDS,
      });
    }
    return data;
  });

  init(config: MapConfig): void {
    this.#mapData.set(MapGenerator.generate(config));
  }

  isBlocked(x: number, y: number): boolean {
    const { obstacles, config } = this.mapData();
    if (x < 0 || y < 0 || x >= config.width || y >= config.height) return true;
    return obstacles.some((obstacle) => obstacle.x === x && obstacle.y === y);
  }

  // Check if position is within minDistance of any obstacle
  isNearObstacle(x: number, y: number, minDistance: number): boolean {
    const { obstacles } = this.mapData();
    return obstacles.some((obstacle) => {
      const distance = Math.hypot(obstacle.x - x, obstacle.y - y);
      return distance < minDistance;
    });
  }

  // Get all obstacles within a certain radius for area checking
  getObstaclesInRadius(
    x: number,
    y: number,
    radius: number,
  ): { x: number; y: number; distance: number }[] {
    const { obstacles } = this.mapData();
    return obstacles
      .map((obstacle) => ({
        ...obstacle,
        distance: Math.hypot(obstacle.x - x, obstacle.y - y),
      }))
      .filter((obstacle) => obstacle.distance <= radius);
  }

  toggleTile(x: number, y: number, blocked: boolean): void {
    const data = this.#mapData();
    if (!data) return;
    if (x < 0 || y < 0 || x >= data.config.width || y >= data.config.height)
      return;

    let newObstacles: { x: number; y: number }[];

    if (blocked) {
      // Add obstacle if it doesn't already exist
      if (this.isBlocked(x, y)) {
        return; // Already blocked
      } else {
        newObstacles = [...data.obstacles, { x, y }];
      }
    } else {
      // Remove obstacle if it exists - keep obstacles that don't match the coordinates
      newObstacles = data.obstacles.filter(
        (obstacle) => obstacle.x !== x || obstacle.y !== y,
      );
    }

    this.#mapData.set({ ...data, obstacles: newObstacles });
  }
}
