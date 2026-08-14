# Huavoi Project - GEMINI.md

This project is a Next.js (App Router) landing page and pricing application for an AI-powered solutions service.

## Project Overview

- **Purpose**: SaaS landing page and pricing.
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (v4)
- **Internationalization**: `next-intl`
- **Theme**: Automatic dark mode support via `next-themes`.

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
- **Internationalization**: Content is managed via `next-intl`. Translations are located in `public/locales/` organized by language code (en, chs, cht, es, fr, de, ja, ko) with namespace files (common.json, header.json, home.json, pricing.json, etc.).
- **Components**: UI components reside in `src/components/`. Pages are in `src/app/`.

## Key Files

- `src/app/`: Next.js App Router pages (Landing, Pricing).
- `src/components/`: Reusable UI components (Header, Footer, etc.).
- `public/locales/`: Translation files organized by language (en, chs, cht, es, fr, de, ja, ko) with namespace files for different sections.
- `next.config.ts`: Next.js configuration.
- `tailwind.config.ts`: Tailwind CSS configuration.
