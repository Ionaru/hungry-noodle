# 🍜 Hungry Noodle

An Android mobile game based on the classic Snake game, built with modern web technologies and compiled to native Android with Tauri.

[![Download on Google Play](https://img.shields.io/badge/Download-Google%20Play-green?logo=google-play)](https://play.google.com/store/apps/details?id=com.ionaru.hungrynoodle)
[![Version](https://img.shields.io/badge/version-0.3.5-blue.svg)](https://github.com/Ionaru/hungry-noodle)

> **Note:** The app is currently in development. The Play Store link will be activated upon release.

## 📖 Description

Hungry Noodle is a family-friendly mobile game that reimagines the classic Snake game with modern gameplay mechanics, progression systems, and engaging cosmetics. Designed for casual mobile gamers, the game features:

- **Quick, engaging gameplay** - 2-5 minute game sessions perfect for on-the-go gaming
- **One-handed controls** - Simple swipe gestures optimized for mobile
- **Offline-first design** - Play anywhere, anytime without internet connection
- **Progression & unlocks** - Earn Noodle Coins to unlock new maps, snake types, and cosmetics
- **Daily challenges** - Fresh challenges every day to keep gameplay exciting
- **Family-friendly** - PEGI 3 / ESRB E rated with cute aesthetics and no violence

## 🚀 Installation

### Prerequisites

- **Node.js** 18+
- **pnpm** 10.18.2+ (package manager)
- **Rust** (for Tauri development)
- **Android Studio** (for Android builds)

### Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/Ionaru/hungry-noodle.git
   cd hungry-noodle
   ```

2. **Install pnpm** (if not already installed)

   ```bash
   npm install -g pnpm
   ```

3. **Install dependencies**

   ```bash
   pnpm install
   ```

4. **Start the development server**
   ```bash
   pnpm start
   ```
   The app will be available at `http://localhost:4200`

### Building for Production

#### Web Build

```bash
pnpm build
```

#### Android APK Build

```bash
pnpm run build:android:prod:apk
```

This will create an APK for ARM64 devices in `src-tauri/gen/android/app/build/outputs/apk/`.

## 🏗️ Architecture

### Technology Stack

| Component              | Technology                                               |
| ---------------------- | -------------------------------------------------------- |
| **Frontend Framework** | Angular 20+ with standalone components                   |
| **Game Engine**        | Custom HTML5 Canvas engine                               |
| **State Management**   | Angular Signals + Resource API                           |
| **Styling**            | Tailwind CSS 4+ with custom game UI                      |
| **Mobile Compilation** | Tauri 2 for native Android builds                        |
| **Local Storage**      | IndexedDB (web) / SQLite (mobile) via Tauri Store plugin |
| **Analytics**          | Google Analytics 4 with custom event tracking            |
| **Localization**       | Angular i18n (English first, expandable)                 |
| **Server Database**    | PostgreSQL for global leaderboards                       |
| **Authentication**     | Google Play Games Services                               |
| **Monetization**       | Google Pay integration                                   |

### Project Structure

```
hungry-noodle/
├── src/                        # Angular application source
│   ├── app/                    # Application components and services
│   │   ├── services/          # Core game services (state, progression, storage)
│   │   └── ...                # Components, routes, and utilities
│   ├── public/                # Static assets
│   └── styles.css             # Global styles
├── src-tauri/                 # Tauri (Rust) backend
│   ├── src/                   # Rust source code
│   ├── gen/android/           # Generated Android project
│   ├── capabilities/          # Tauri capability definitions
│   └── tauri.conf.json        # Tauri configuration
├── PLAN.md                    # Detailed game design document
└── package.json               # Node dependencies and scripts
```

### Core Architecture Principles

1. **Offline-First**: Core gameplay works completely offline with local storage
2. **Reactive State**: Angular Signals for reactive, performant state management
3. **Mobile-Optimized**: Vertical screen layout, touch controls, < 50MB app size
4. **Performance**: Target 60 FPS on mid-range Android devices
5. **Modular Services**: Clean separation between game logic, storage, and UI

### Key Services

- **GameState** - Manages real-time game state (snake position, food, score, status)
- **Progression** - Handles player progression, currency, unlocks, and leaderboards
- **Store** - Provides unified storage interface (IndexedDB for web, Tauri Store for mobile)
- **DataSync** - Manages online/offline synchronization for leaderboards and challenges

For detailed architecture information, see [PLAN.md](PLAN.md).

## 🎮 Development

### Available Scripts

- `pnpm start` - Start development server
- `pnpm build` - Build for production
- `pnpm check` - Run all checks (format, style, lint)
- `pnpm fix` - Auto-fix formatting, style, and lint issues
- `pnpm run tauri dev` - Run Tauri development mode
- `pnpm run build:android:prod:apk` - Build Android APK

### Code Quality

The project uses automated code quality tools:

- **Prettier** - Code formatting
- **Stylelint** - CSS/SCSS linting
- **ESLint** - TypeScript/JavaScript linting with Angular rules

Run `pnpm check` before committing to ensure code quality.

### Angular Style Guide

This project extends the [official Angular style guide](https://angular.dev/style-guide) with additional conventions:

- Use descriptive names for all entities
- Use signal-based APIs instead of decorators (`viewChild()` vs `@ViewChild`)
- Don't suffix components/services with "Component"/"Service"
- Use native private `#` prefix instead of TypeScript `private`
- Never import `CommonModule` (not needed with standalone components)
- Use shorthand closing tags: `<app-component />`
- Split component logic and HTML when files exceed 100 lines

## 🤝 Contributing

We welcome contributions to Hungry Noodle! Here's how you can help:

### Getting Started

1. **Fork the repository** and clone your fork
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** following our code style guidelines
4. **Test your changes** thoroughly
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Contribution Guidelines

- Follow the Angular style guide outlined above
- Write clear, descriptive commit messages
- Keep changes focused - one feature/fix per PR
- Update documentation for any changed functionality
- Ensure all linting and formatting checks pass (`pnpm check`)
- Test on both web and mobile (if applicable)

### Types of Contributions

- 🐛 **Bug fixes** - Report or fix bugs in gameplay or UI
- ✨ **New features** - Propose and implement new game mechanics or features
- 📝 **Documentation** - Improve documentation or code comments
- 🎨 **Design** - Enhance UI/UX or create new visual assets
- 🌍 **Localization** - Add translations for new languages
- 🧪 **Testing** - Add or improve test coverage

### Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what's best for the community
- Show empathy towards other contributors

### Need Help?

- Check existing [Issues](https://github.com/Ionaru/hungry-noodle/issues) for known problems
- Review [PLAN.md](PLAN.md) for project roadmap and design decisions
- Open a new issue for bugs, feature requests, or questions

## 📱 Download

### Google Play Store

[![Get it on Google Play](https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png)](https://play.google.com/store/apps/details?id=com.ionaru.hungrynoodle)

> **Coming Soon!** The app is currently in active development. Check back soon for the official release.

### Beta Testing

Interested in testing early versions? Watch this repository for beta testing announcements!

## 🙏 Acknowledgments

- Built with [Angular](https://angular.dev/)
- Powered by [Tauri](https://tauri.app/)
- Gesture detection from [Ionic Framework](https://ionicframework.com/)
- Icons by [Font Awesome](https://fontawesome.com/)

## 📞 Contact

- **GitHub Issues**: [Report bugs or request features](https://github.com/Ionaru/hungry-noodle/issues)
- **Project Maintainer**: [@Ionaru](https://github.com/Ionaru)

---

Made with 💚 by [@Ionaru](https://github.com/Ionaru)
