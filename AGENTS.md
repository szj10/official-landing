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

| Command          | Description                        |
| :--------------- | :--------------------------------- |
| `npm run dev`    | Starts the development server.     |
| `npm run build`  | Builds the project for production. |
| `npm start`      | Starts the production server.      |
| `npm run lint`   | Runs ESLint.                       |
| `npm run format` | Runs Prettier to format code.      |

## Development Conventions

- **Styling**: Use Tailwind CSS utility classes.
- **Type Safety**: Use TypeScript. Avoid explicit `any`.
- **Formatting**: The project uses Prettier and `lint-staged`. Ensure files are formatted before committing.
- **Internationalization**: Content should be managed via `next-intl`. Translations are located in `src/locales/`.
- **Components**: UI components reside in `src/components/`. Pages are in `src/app/`.

## Key Files

- `src/app/`: Next.js App Router pages (Landing, Pricing).
- `src/components/`: Reusable UI components (Header, Footer).
- `src/locales/`: JSON translation files.
- `tailwind.config.ts`: Tailwind configuration (if applicable, though Tailwind 4 uses CSS).
- `next.config.ts`: Next.js configuration.
