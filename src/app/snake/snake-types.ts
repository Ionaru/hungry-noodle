import {
  faBolt,
  faBurger,
  faClover,
  faFaceSmile,
  faGhost,
  faMagnet,
} from "@awesome.me/kit-fa99832706/icons/slab/regular";
import { IconDefinition } from "@fortawesome/angular-fontawesome";

export type SnakeTypeId =
  | "friendly"
  | "speedy"
  | "lucky"
  | "chunky"
  | "magnetic"
  | "ghost";

export interface SnakeTypeInfo {
  readonly id: SnakeTypeId;
  readonly name: string;
  readonly tagline: string;
  readonly description: string;
  readonly specialPower: string;
  readonly characteristics: readonly string[];
  readonly icon: IconDefinition;
  readonly accentClass: string;
  readonly previewVideoUrl?: string;
  readonly unlockHint: string;
}

export const SNAKE_TYPES: readonly SnakeTypeInfo[] = [
  {
    id: "friendly",
    name: "Friendly Noodle",
    tagline: "The classic companion",
    description:
      "A cheerful starter noodle. Balanced speed, balanced size — pure comfort food.",
    specialPower: "None — just vibes and good manners.",
    characteristics: ["Balanced speed", "Standard size", "Beginner friendly"],
    icon: faFaceSmile,
    accentClass: "from-green-400 to-emerald-500",
    unlockHint: "Always available — the noodle of the people.",
  },
  {
    id: "speedy",
    name: "Speedy Noodle",
    tagline: "Built for the fast lane",
    description:
      "Whips around the world at high speed and racks up a higher score multiplier for the brave.",
    specialPower: "Score multiplier increases the longer you stay alive.",
    characteristics: ["Faster movement", "Higher score multiplier", "Tougher to control"],
    icon: faBolt,
    accentClass: "from-yellow-400 to-orange-500",
    unlockHint: "Reach a length of 50 in a single run to unlock.",
  },
  {
    id: "lucky",
    name: "Lucky Noodle",
    tagline: "Fortune favours the hungry",
    description:
      "Loves shiny things. Golden food appears far more often when this noodle is on the field.",
    specialPower: "Golden food spawn rate is dramatically increased.",
    characteristics: ["Golden food magnet", "Standard speed", "Bonus coins"],
    icon: faClover,
    accentClass: "from-lime-400 to-green-600",
    unlockHint: "Eat 25 golden noodles across all games to unlock.",
  },
  {
    id: "chunky",
    name: "Chunky Noodle",
    tagline: "Big, bold, and easygoing",
    description:
      "A larger, more forgiving noodle. Easier to steer but the tighter quarters leave less room to grow.",
    specialPower: "Larger hitbox makes turning gentler — perfect for relaxed runs.",
    characteristics: ["Bigger size", "Easier controls", "Lower scores"],
    icon: faBurger,
    accentClass: "from-orange-400 to-red-500",
    unlockHint: "Complete a perfect game to unlock.",
  },
  {
    id: "magnetic",
    name: "Magnetic Noodle",
    tagline: "Pulls food right to its mouth",
    description:
      "An attractive noodle. Nearby food drifts toward the head as if drawn by an invisible force.",
    specialPower: "Auto-attracts food within a small radius around the head.",
    characteristics: ["Auto food pickup", "Standard speed", "Field-dependent"],
    icon: faMagnet,
    accentClass: "from-blue-400 to-indigo-600",
    unlockHint: "Earn 1,000 Noodle Coins to unlock.",
  },
  {
    id: "ghost",
    name: "Ghost Noodle",
    tagline: "Phases through its own mistakes",
    description:
      "A spectral noodle that can briefly pass through its own body — a small mercy for big snakes.",
    specialPower: "Tap to phase through your own body for 3 seconds (cooldown).",
    characteristics: ["Phase ability", "Standard speed", "Skill ceiling"],
    icon: faGhost,
    accentClass: "from-purple-400 to-fuchsia-600",
    unlockHint: "Survive 5 minutes in a single run to unlock.",
  },
];

export const DEFAULT_SNAKE_TYPE: SnakeTypeId = "friendly";

export function getSnakeType(id: SnakeTypeId): SnakeTypeInfo {
  const match = SNAKE_TYPES.find((snake) => snake.id === id);
  return match ?? SNAKE_TYPES[0];
}
