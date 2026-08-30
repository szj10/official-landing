# Translation Files (i18n)

This directory contains all translation files for the Huavoi application, organized by language and namespace.

## 📁 File Structure

```
public/locales/
├── en/                          # English (source language)
│   ├── common.json
│   ├── footer.json
│   ├── header.json
│   ├── home.json
│   ├── legal.json
│   ├── news.json
│   ├── playground.json
│   ├── pricing.json
│   ├── sample-texts.json
│   └── sample-voices.json
├── zh-CN/                       # Simplified Chinese (简体中文)
├── zh-TW/                       # Traditional Chinese (繁體中文)
├── es/                          # Spanish (Español)
├── fr/                          # French (Français)
├── de/                          # German (Deutsch)
├── ja/                          # Japanese (日本語)
└── ko/                          # Korean (한국어)
```

Each language folder contains the same namespace files as the English folder.

## 🎯 How to Translate

### For i18n Team Members

1. **Navigate to the target language folder** (e.g., `public/locales/zh-CN/` for Simplified Chinese)

2. **Open the namespace file** (e.g., `header.json`, `home.json`, etc.)

3. **Find placeholder texts** - Look for values like:

   ```json
   "title": "[TRANSLATE: English text here]"
   ```

4. **Replace with translation**:

   ```json
   "title": "中文翻译"
   ```

5. **Save the file** - Changes will be automatically reflected in the app when you restart `pnpm run dev`

### Translation Guidelines

- **Keep the JSON structure intact** - Only modify the values, not the keys
- **Maintain placeholders** - If a translation is not ready, keep the `[TRANSLATE: ...]` format
- **Preserve formatting** - Keep any special characters like `→`, emojis, or HTML-like tags
- **Test your changes** - Run `pnpm run dev` to see translations in action
- **Consistency** - Use consistent terminology across all namespace files

## 📝 Namespace Files

Translations are organized by functional areas:

- **`common.json`** - Shared buttons and links (Get Started, Learn More, etc.)
- **`header.json`** - Navigation menu items and header elements
- **`home.json`** - Main landing page hero section, features, and trust sections
- **`pricing.json`** - Pricing page content and plan descriptions
- **`footer.json`** - Footer links and information
- **`news.json`** - News and blog-related content
- **`playground.json`** - Playground/demo page content
- **`legal.json`** - Legal page references (Privacy Policy, Terms of Service)
- **`sample-texts.json`** - Sample text examples used in the application
- **`sample-voices.json`** - Sample voice descriptions and metadata

## 🔄 Adding a New Language

1. Create a new folder in `public/locales/` with the language code (e.g., `pt/` for Portuguese)
2. Copy all JSON files from the `en/` folder to the new language folder
3. Replace all English text with `[TRANSLATE: original text]` placeholders
4. Add the language configuration to `next.config.ts` or the i18n configuration
5. Add the language option in the Header component
6. Translate files one namespace at a time

## 💡 Tips

- Use a JSON validator to check syntax before saving
- Keep translations concise - UI space may be limited
- Consider cultural nuances, not just literal translations
- For long texts, ensure they fit in the UI layout
- Test in dark mode to ensure translated text doesn't overflow

## 🛠️ Technical Details

- Format: JSON
- Encoding: UTF-8
- Nesting: Supported (use dot notation in code: `t('namespace:key.nested')`)
- Missing translations: Falls back to the English version from the `en/` folder
- i18n: Custom `I18nProvider` in `src/i18n/` (BCP-47 locale codes)

## 📞 Need Help?

Contact the development team if you:

- Find unclear or ambiguous source text
- Need context for a specific translation
- Encounter technical issues with the files
- Have questions about namespace organization
