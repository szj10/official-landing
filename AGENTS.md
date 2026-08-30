# Huavoi Project - AGENTS.md

This project is a Next.js (App Router) landing page, pricing application, and interactive TTS playground for an AI-powered solutions service.

## Project Overview

- **Purpose**: SaaS landing page, pricing, and TTS playground demo.
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (v4)
- **Internationalization**: Custom `I18nProvider` in `src/i18n/` (BCP-47 locale codes, client-side JSON namespaces)
- **Theme**: Automatic dark mode support via `next-themes`.
- **Package Manager**: pnpm (primary), npm compatible

## Building and Running

| Command           | Description                        |
| :---------------- | :--------------------------------- |
| `pnpm run dev`    | Starts the development server.     |
| `pnpm run build`  | Builds the project for production. |
| `pnpm start`      | Starts the production server.      |
| `pnpm run lint`   | Runs ESLint.                       |
| `pnpm run format` | Runs Prettier to format code.      |

## Development Conventions

- **Styling**: Use Tailwind CSS utility classes.
- **Type Safety**: Use TypeScript. Avoid explicit `any`.
- **Formatting**: The project uses Prettier and `lint-staged`. Ensure files are formatted before committing.
- **Internationalization**: Custom `I18nProvider` with BCP-47 locale codes. Translations are in `public/locales/` organized by language code (en, zh-CN, zh-TW, es, fr, de, ja, ko) with namespace files (common.json, header.json, home.json, pricing.json, etc.).
- **Components**: UI components reside in `src/components/`. Pages are in `src/app/`.

## Key Files

- `src/app/`: Next.js App Router pages (Landing, Pricing, Playground, Legal pages).
- `src/app/playground/`: Interactive TTS playground with voice selection, recording, and synthesis.
- `src/components/`: Reusable UI components (Header, Footer, etc.).
- `public/locales/`: Translation files organized by language (en, zh-CN, zh-TW, es, fr, de, ja, ko) with namespace files for different sections.
- `content/legal/`: Legal pages (Privacy Policy, Terms of Service) in multiple languages.
- `content/posts/`: Blog posts for the news section.
- `next.config.ts`: Next.js configuration.
- `tailwind.config.ts`: Tailwind CSS configuration.
- `.pnpmfile.cjs`: pnpm hooks for build script allowlisting.
- `pnpm-workspace.yaml`: pnpm workspace configuration.
