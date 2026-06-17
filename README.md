# Huavoi - AI-Powered Solutions Landing Page

A Next.js + TypeScript project for a product landing page and pricing pages, inspired by modern SaaS websites.

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the landing page.

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Landing page
│   ├── pricing/
│   │   └── page.tsx        # Pricing page
│   └── globals.css         # Global styles
└── components/
    ├── Header.tsx          # Navigation header
    └── Footer.tsx          # Site footer
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

The header includes a language switcher with support for:

- 🇺🇸 English
- 🇨🇳 中文 (Chinese)
- 🇪🇸 Español (Spanish)
- 🇫🇷 Français (French)
- 🇩🇪 Deutsch (German)
- 🇯🇵 日本語 (Japanese)

Note: The language switcher UI is ready. To implement full i18n, integrate with `next-intl` or similar library.

## Customization

### Branding

Update the logo and brand name in:

- `src/components/Header.tsx`
- `src/components/Footer.tsx`

### Colors

The project uses Tailwind's default color palette. Customize in `tailwind.config.ts` if needed.

### Content

- Landing page content: `src/app/page.tsx`
- Pricing tiers: `src/app/pricing/page.tsx`

## License

MIT
