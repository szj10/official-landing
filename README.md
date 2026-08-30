# Huavoi - AI-Powered Solutions Landing Page

A Next.js + TypeScript project for a product landing page, pricing pages, and interactive TTS playground, inspired by modern SaaS websites.

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- pnpm (fast, efficient package manager)

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm run dev
```

Open [http://localhost:3019](http://localhost:3019) to view the landing page.

### Build

```bash
pnpm run build
```

### Production

```bash
pnpm start
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with metadata
│   ├── page.tsx                # Landing page
│   ├── pricing/
│   │   └── page.tsx            # Pricing page
│   ├── playground/             # Interactive TTS Playground
│   │   ├── page.tsx            # Playground page
│   │   ├── PlaygroundContent.tsx
│   │   ├── voices.config.ts    # Voice configurations
│   │   ├── components/         # Modular components (EditorPanel, VoiceModal, PlayerBar, etc.)
│   │   └── [other routes]      # Privacy, Terms, News sections
│   ├── globals.css             # Global styles
│   └── [other routes]          # News, About, Privacy, Terms
├── components/
│   ├── Header.tsx              # Navigation header
│   ├── Footer.tsx              # Site footer
│   └── [other UI components]
└── i18n/
    └── [Internationalization setup]
```

## Pages

### Landing Page (/)

- Hero section with CTA
- Trust badges (company logos)
- Product/solution cards
- Feature highlights
- FAQ section
- Call-to-action banner

### Pricing Page (/pricing)

- Pricing tiers (Starter, Professional, Business, Enterprise)
- Monthly/Annual billing toggle
- Feature comparison table
- FAQ section
- Contact sales CTA

### Playground Page (/playground)

- **Text Input Panel**: Edit or select sample texts
- **Voice Selection**: Choose from stock voices or upload custom voice prompts
- **Microphone Recording**: Record your own voice for custom synthesis
- **Speed Control**: Adjust synthesis speed (slow, normal, fast)
- **Real-time Generation**: Generate speech with queue status tracking
- **Playback Controls**: Play, pause, seek, and download generated audio
- **History**: Track recent voices and TTS jobs with persistence via localStorage

## Technologies

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **React** - UI library

## Features

- ✅ Responsive design (mobile-first)
- ✅ **Dark mode** - Automatically detects system preference
- ✅ SEO optimized
- ✅ Static generation for fast performance
- ✅ Accessible components
- ✅ Modern UI with gradients and animations

## Dark Mode

The application automatically adapts to your system's appearance preference (light or dark mode):

- **Automatic detection**: Uses `next-themes` to detect system preference
- **No flash**: Prevents hydration mismatch with `suppressHydrationWarning`
- **Full coverage**: All components support both light and dark themes
- **Manual toggle**: Theme switcher dropdown in header (Light/Dark/System)
- **CSS variables**: Uses Tailwind's dark mode with class strategy

## Language Support

Full i18n support with BCP-47 locale codes:

- 🇺🇸 English (en)
- 🇨🇳 简体中文 (zh-CN)
- 🇹🇼 繁體中文 (zh-TW)
- 🇪🇸 Español (es)
- 🇫🇷 Français (fr)
- 🇩🇪 Deutsch (de)
- 🇯🇵 日本語 (ja)
- 🇰🇷 한국어 (ko)

Translation files are organized in `public/locales/<language>/<namespace>.json` by language and feature namespace.

## Customization

### Branding

Update the logo and brand name in:

- `src/components/Header.tsx`
- `src/components/Footer.tsx`

### Playground Configuration

Customize the playground experience:

- **Voices**: Edit `src/app/playground/voices.config.ts` to add/modify voice options
- **Sample Texts**: Update sample text options in the playground components
- **API Integration**: Configure backend endpoints in environment variables (.env.local)

### Colors

The project uses Tailwind CSS v4. Customize in `tailwind.config.ts` if needed.

### Content

- Landing page: `src/app/page.tsx`
- Pricing tiers: `src/app/pricing/page.tsx`
- Playground: `src/app/playground/PlaygroundContent.tsx` and components
- Legal pages: `content/legal/privacy/` and `content/legal/terms/`
- Blog posts: `content/posts/`

## Development Notes

### Package Manager

This project uses **pnpm** for efficient dependency management. The project includes:

- `.npmrc` - npm configuration (for compatibility)
- `.pnpmfile.cjs` - pnpm hooks for build script allowlisting
- `pnpm-workspace.yaml` - pnpm workspace configuration
- `pnpm-lock.yaml` - pnpm lock file for reproducible installs

**Note**: Use `pnpm` instead of `npm` to ensure consistent installs and better performance.

### Code Formatting & Linting

The project uses:

- **Prettier** for code formatting (auto-formats on save with pre-commit hook)
- **ESLint** for code quality checks
- **lint-staged** and **Husky** for git hooks

Run manually:

```bash
pnpm run lint        # Check for linting issues
pnpm run format      # Auto-format all files
pnpm run format:check # Check if files are formatted
```

### TypeScript

This project is fully typed with TypeScript. Avoid using `any` type and ensure strict type safety.

## License

MIT
