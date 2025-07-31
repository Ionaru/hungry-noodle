# Hungry Noodle Game Plan

An Android App game based on Snake.

## 🎯 Target Audience

**Casual Mobile Gamers**

- Session Length: 2-5 minute games ideal
- Simple Controls: Swipe gestures, tap to pause
- Visual Feedback: Clear, colorful, satisfying animations
- Progression: Frequent small rewards, clear next goals
- Family-Friendly: Cute aesthetics, no violence, PEGI 3/ESRB E rating
- Playable with one hand.

## 🏗️ Technical Architecture

### Tech Stack

- **Frontend**: Angular 20+ with standalone components, designed for a vertical (phone) screen.
- **Game Engine**: HTML5 Canvas with custom lightweight engine
- **State Management**: Angular Signals + Resource API
- **Styling**: Tailwind + custom CSS for game UI
- **Mobile**: Tauri for Android compilation
- **Analytics**: Google Analytics 4 + custom event tracking
- **Localization**: Angular i18n package (English first, expandable)
- **Offline Storage**: IndexedDB via Angular service
- **Database**: SQLite (local) + PostgreSQL (server) for leaderboards
- **Authentication**: Google Play
- **Monetization**: Google Pay

### Core Services Structure

```typescript
// Game state using Signals
@Injectable()
export class GameStateService {
  // Reactive game state
  score = signal(0);
  snake = signal<SnakeSegment[]>([]);
  food = signal<Food[]>([]);
  gameStatus = signal<"menu" | "playing" | "paused" | "gameOver">("menu");

  // Computed values
  highScore = computed(() => Math.max(...this.allScores()));
  canvasSize = computed(() => this.getCanvasSize());
}

// Currency & Progression using Resource API
@Injectable()
export class ProgressionService {
  private noodleCoins = signal(0);
  private unlockedMaps = signal<string[]>(["classic"]);

  // Resource for server sync when online
  leaderboard = resource({
    request: () => ({ playerId: this.getPlayerId() }),
    loader: ({ request }) => this.syncLeaderboard(request.playerId),
  });
}
```

## 🎮 Core Gameplay Systems

### Snake Types & Unique Mechanics

- **Friendly Noodle**: Standard gameplay, cute animations
- **Speedy Noodle**: Faster movement, higher score multiplier
- **Lucky Noodle**: Rare golden food appears more often
- **Chunky Noodle**: Bigger, easier to control, lower scores
- **Magnetic Noodle**: Attracts nearby food automatically
- **Ghost Noodle**: Can phase through its own body for 3 seconds (cooldown)

### Map System

- **Starter Maps**: Classic square, maze-like designs
- **Advanced Maps**: Moving obstacles, teleporters, shrinking boundaries
- **Procedural Maps**: Algorithm-generated levels for endless variety
- **Community Maps**: Player-created levels (future feature)

### Currency & Progression

**Noodle Coins (Primary Currency):**

- Earned by: Length achieved, perfect games, daily play streaks
- Base rate: 1 coin per food eaten + length bonus
- Multipliers for: Difficult maps, harder snake types

**Golden Noodles (Premium Currency):**

- Purchasable with real money
- Earned rarely through: Perfect games, weekly challenges, piggy bank

## 💰 Monetization Strategy

### Family-Friendly Monetization

- **No loot boxes** - direct purchases only
- **Clear pricing** - no confusing currency conversions
- **Parental controls** - purchase confirmations
- **Generous free content** - 80% of game playable without purchases

### Piggy Bank System

- Collects 10% of earned Noodle Coins automatically
- Can be opened for $1.99-4.99 depending on amount stored
- Visual feedback shows coins being added
- Maximum capacity encourages regular purchases

### In-App Purchases

- **Starter Pack**: $2.99 - 500 Golden Noodles + exclusive skin
- **Golden Noodle Packs**: $0.99-19.99 various amounts
- **Snake Pass**: $4.99 monthly - 2x coin earning + exclusive challenges
- **Cosmetic Bundles**: $1.99-7.99 themed skin collections

## 🏆 Progression & Unlocks

### Map Unlock System

- **Level 1-5**: Basic maps
- **Level 6-10**: Maze maps
- **Level 11-15**: Dynamic obstacle maps
- **Level 16+**: Procedural + community maps

### Snake Type Unlocks

- Achieve specific milestones (length 50, perfect game, etc.)
- Some available only through Golden Noodle purchase
- Weekly rotation of "trial" premium snakes

## 🎯 Daily Challenge System

### Daily Challenges (like Mini Metro)

- "Reach length 30 without eating red food"
- "Survive 2 minutes on speed mode"
- "Collect 100 coins in one game"

### Weekly Challenges

- More complex, multi-day objectives
- Higher rewards including exclusive cosmetics

## 🎨 Cosmetic System

### Categories

- **Skins**: Different noodle textures/colors
- **Trails**: Particle effects following the snake
- **Food Themes**: Different food art styles
- **Backgrounds**: Animated backgrounds

### Pricing Tiers

- Common: 50-100 Noodle Coins
- Rare: 200-500 Noodle Coins
- Epic: 1000+ Noodle Coins or Golden Noodles
- Legendary: Golden Noodles only

## ⏰ Idle Game Integration

### Noodle Farm (Idle System)

- Runs in background, generates coins slowly
- Upgradeable "farms" that produce coins
- Players can check progress and collect offline earnings
- Synergizes with main game (playing actively boosts idle rate)

## 📱 UI/UX Structure

### Component Hierarchy

```
AppComponent
├── MainMenuComponent
├── GameCanvasComponent (core game logic)
├── HudComponent (score, pause, etc.)
├── ShopComponent
│   ├── CosmeticsTabComponent
│   ├── SnakeTypesTabComponent
│   └── CurrencyTabComponent
├── ProgressionComponent
│   ├── HighScoresComponent
│   ├── MapProgressComponent
│   └── AchievementsComponent
├── DailyChallengesComponent
├── SettingsComponent
└── PiggyBankComponent
```

### Navigation Structure

```
Main Menu
├── Play
│   ├── Quick Play (last used settings)
│   ├── Map Selection
│   ├── Snake Type Selection
│   └── Custom Game
├── Progression
│   ├── High Scores
│   ├── Achievements
│   ├── Snake Collection
│   └── Map Progress
├── Shop
│   ├── Cosmetics
│   ├── Snake Types
│   └── Currency Packs
├── Daily Challenges
├── Noodle Farm (Idle)
└── Settings
```

## 📊 Analytics Implementation

### Event Tracking for Casual Gamers

```typescript
@Injectable()
export class AnalyticsService {
  trackGameStart(snakeType: string, mapType: string) {
    gtag("event", "game_start", {
      snake_type: snakeType,
      map_type: mapType,
      session_count: this.getSessionCount(),
    });
  }

  trackGameEnd(score: number, length: number, duration: number) {
    gtag("event", "game_end", {
      score: score,
      length: length,
      duration_seconds: duration,
      coins_earned: this.calculateCoinsEarned(score),
    });
  }

  // Engagement metrics for casual audience
  trackRetention(daysSinceInstall: number) {
    gtag("event", "retention", {
      days_since_install: daysSinceInstall,
      games_played: this.getTotalGamesPlayed(),
    });
  }
}
```

## 💾 Offline-First Data Strategy

### Progressive Data Sync

```typescript
@Injectable()
export class DataSyncService {
  // Offline-first approach
  private offlineData = signal({
    highScores: [],
    unlockedContent: [],
    cosmetics: [],
    settings: {},
  });

  // Sync when online
  syncWhenOnline = resource({
    request: () => navigator.onLine,
    loader: () => this.syncWithServer(),
  });

  // Features requiring internet
  dailyChallenges = resource({
    request: () => ({ date: new Date().toDateString() }),
    loader: ({ request }) => this.fetchDailyChallenges(request.date),
  });
}
```

## 🕹️ Mobile-Optimized Controls

### Touch Controls Implementation

This uses the GestureController from @ionic/angular/standalone

```typescript
@Component({...})
export class TouchControlsComponent {

  readonly #gestureController = inject(GestureController);
  readonly #element = inject(ElementRef)

  readonly #gesture = this.#gestureController.create(
    {
      el: this.#element.nativeElement,
      gestureName: "swipe",

      onStart: () => {},
      onMove: (detail: GestureDetail) => {},
      onEnd: () => {},
    },
    true
  );

  constructor() {
    this.#gesture.enable();
  }
}
```

## 🚀 Development Phases

### Phase 1: Angular Foundation (3-4 weeks)

- Set up Angular services with Signals
- Basic canvas game loop
- Core snake gameplay
- Touch controls
- Local storage for offline play

**Deliverables:**

- Working snake game with basic mechanics
- Touch control system
- Local high score tracking
- Basic Angular service architecture

### Phase 2: Core Features (4-5 weeks)

- Shop system with cosmetics
- Map progression system
- Analytics integration
- Daily challenges (offline-capable)

**Deliverables:**

- Complete shop system
- Multiple maps with unlock progression
- Daily challenge system
- Analytics tracking implementation

### Phase 3: Engagement & Polish (4-5 weeks)

- Piggy bank system
- Idle mechanics
- Leaderboard sync
- Performance optimization for mobile

**Deliverables:**

- Monetization systems
- Idle game mechanics
- Online leaderboards
- Mobile performance optimization

### Phase 4: Launch Preparation (2-3 weeks)

- Tauri Android build optimization
- Family-friendly monetization testing
- Analytics validation
- App store submission

**Deliverables:**

- Production-ready Android build
- App store assets and descriptions
- Analytics dashboard setup
- Launch-ready application

## 🌍 Localization Strategy

### Angular i18n Setup

```typescript
// Prepare for future localization
@Injectable()
export class LocalizationService {
  private currentLang = signal("en");

  // Text resources structure
  private texts = {
    en: {
      menu: {
        play: "Play",
        shop: "Shop",
        highScores: "High Scores",
      },
      game: {
        score: "Score",
        length: "Length",
        gameOver: "Game Over!",
      },
    },
    // Future: fr, es, de, etc.
  };
}
```

## 📝 Technical Requirements Summary

### Offline Capabilities

- Core gameplay works completely offline
- Local high score storage
- Settings and progression saved locally
- Offline daily challenges with cached content

### Online Features

- Global leaderboards
- Real-time daily challenges
- Cloud save backup
- Analytics data transmission

### Performance Targets

- 60 FPS gameplay on mid-range Android devices
- < 3 second app startup time
- < 50MB total app size
- Smooth touch response (< 100ms input lag)

### Family-Friendly Compliance

- PEGI 3 / ESRB E rating compliance
- No violence or inappropriate content
- Clear, simple monetization
- Parental control integration

## 📋 Next Steps

1. **Project Analysis** - Review existing Tauri + Angular setup
2. **Service Architecture** - Implement core Angular services with Signals
3. **Game Engine Setup** - Create canvas component with basic snake gameplay
4. **UI Structure** - Build main menu and navigation system

## 🎯 Success Metrics

### Engagement Metrics

- Daily Active Users (DAU)
- Session length (target: 3-5 minutes)
- Retention rates (Day 1, 7, 30)
- Games per session

### Monetization Metrics

- Conversion rate to paying users
- Average Revenue Per User (ARPU)
- Piggy bank open rate
- Cosmetic purchase frequency

### Progression Metrics

- Map unlock progression
- Snake type unlock rates
- Daily challenge completion rates
- Idle system engagement
