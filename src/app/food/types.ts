export enum FoodType {
  NORMAL = "NORMAL",
  GOLDEN = "GOLDEN",
  SPECIAL = "SPECIAL",
}

export interface Food {
  x: number;
  y: number;
  type: FoodType;
  value: number;
}
