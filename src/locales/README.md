# Translation Files (i18n)

This directory contains all translation files for the Huavoi application.

## 📁 File Structure

```
src/locales/
├── en.json    # English (source language)
├── zh.json    # Chinese (中文)
├── es.json    # Spanish (Español)
├── fr.json    # French (Français)
├── de.json    # German (Deutsch)
└── ja.json    # Japanese (日本語)
```

## 🎯 How to Translate

### For i18n Team Members

1. **Open the target language file** (e.g., `zh.json` for Chinese)

2. **Find placeholder texts** - Look for values like:

   ```json
   "title": "[TRANSLATE: English text here]"
   ```

3. **Replace with translation**:

   ```json
   "title": "中文翻译"
   ```

4. **Save the file** - Changes will be automatically reflected in the app

### Translation Guidelines

- **Keep the JSON structure intact** - Only modify the values, not the keys
- **Maintain placeholders** - If a translation is not ready, keep the `[TRANSLATE: ...]` format
- **Preserve formatting** - Keep any special characters like `→` or emojis
- **Test your changes** - Run `npm run dev` to see translations in action

## 📝 Translation Keys Organization

Translations are organized by sections:

- `common` - Shared buttons and links (Get Started, Learn More, etc.)
- `header` - Navigation menu items
- `hero` - Main landing page hero section
- `trust` - Trust badges section
- `solutions` - Product solutions cards
- `features` - Feature highlights
- `cta` - Call-to-action sections
- `faq` - Frequently asked questions

## 🔄 Adding a New Language

1. Copy `en.json` to a new file (e.g., `ko.json` for Korean)
2. Replace all English text with `[TRANSLATE: original text]` placeholders
3. Add the language to the configuration in `src/i18n/config.ts`
4. Add the language option in the Header component

## 💡 Tips

- Use a JSON validator to check syntax before saving
- Keep translations concise - UI space may be limited
- Consider cultural nuances, not just literal translations
- For long texts, ensure they fit in the UI layout

## 🛠️ Technical Details

- Format: JSON
- Encoding: UTF-8
- Nesting: Supported (use dot notation in code: `t('hero.title')`)
- Missing translations: Falls back to English

## 📞 Need Help?

Contact the development team if you:

- Find unclear or ambiguous source text
- Need context for a specific translation
- Encounter technical issues with the files
