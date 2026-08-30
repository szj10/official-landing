# Translation Guide (Huavoi Landing)

Guide for translators and engineers adding or updating copy on the **Huavoi marketing site**, pricing page, news shell, and **TTS Playground** demo. Source locale is **English (`en`)**. All other locales should follow these principles for consistent product language across ~8 languages.

For file layout and basic `useI18n` usage, see also [`public/locales/README.md`](../../public/locales/README.md). For the authenticated creator app (dashboard, projects, billing), see the companion guide in **studio-web** (`docs/guides/TRANSLATION_GUIDE.md`) — shared terms (voices, TTS, credits) should align where both products surface the same concept.

---

## 1. What gets translated (and what doesn’t)

| Content type                                      | Location                           | Translated?                                                             |
| ------------------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------- |
| UI strings (nav, CTAs, playground, pricing cards) | `public/locales/{locale}/*.json`   | Yes — all locales                                                       |
| Legal pages (Privacy, Terms)                      | `content/legal/{type}/{locale}.md` | Yes — per-locale Markdown                                               |
| Blog / news articles                              | `content/posts/*.md`               | **English only** (UI chrome around posts is translated via `news.json`) |
| Brand names, creator names in trust bar           | `home.json`                        | Keep as-is (e.g. MrBeast, Huavoi)                                       |
| Sample voice display names                        | `sample-voices.json`               | Keep `name` as-is; translate `preview`, `gender`                        |

---

## 2. Core principle: marketing + product UI, not dictionary

This site mixes **landing-page marketing** (hero, features, pricing) with an **interactive TTS demo** (playground). Both should read like a native product — not a word-for-word English export.

Ask for every string:

1. Would a native user expect this on a **SaaS landing page** or **demo tool** in that market?
2. Does it match **AI video / TTS** domain language, or unrelated jargon?

| Bad (literal / wrong domain)        | Why it fails           | Better (`zh-CN` reference)                  |
| ----------------------------------- | ---------------------- | ------------------------------------------- |
| Playground → 操场                   | Schoolyard             | Nav: **体验**; page title: **TTS 体验中心** |
| Community Voices → 社区语音         | Sounds like speech/ASR | **社区音色**                                |
| Your Voice → 你的语音               | Ambiguous              | **您的音色**                                |
| Dashboard (hero image alt) → 仪表板 | Analytics connotation  | **界面预览** or product-appropriate term    |
| Get Started → 得到开始              | Calque                 | **开始使用**                                |

**English is the meaning source, not the syntax template.** Marketing copy may be longer or shorter than English; playground UI should stay concise.

---

## 3. Voice & tone

Huavoi’s public site is **confident, approachable, and product-forward** — not stiff corporate, not hype-heavy startup cliché.

| Context                                  | Tone                                              |
| ---------------------------------------- | ------------------------------------------------- |
| Hero / feature headlines                 | Bold, benefit-led, one clear idea                 |
| Body copy                                | Clear sentences; avoid stacking adjectives        |
| CTAs (`Get Started`, `Start Free Trial`) | Short, action-first                               |
| Playground (recording, queue, errors)    | Same as in-app tools: calm, specific, actionable  |
| Pricing                                  | Transparent; numbers and plan names stay readable |
| Legal                                    | Formal and precise (separate Markdown files)      |

Pick one register per locale (你 vs 您, formal Japanese, etc.) and keep it consistent.

---

## 4. Terminology glossary (must stay consistent)

Agree terms **once per locale**, then reuse across `header`, `home`, `pricing`, `playground`, and `footer`.

| English concept                  | Meaning on this site         | `zh-CN` (reference)      | Notes                                  |
| -------------------------------- | ---------------------------- | ------------------------ | -------------------------------------- |
| **Playground** (nav)             | TTS demo entry in header     | 体验                     | Page title can be longer: TTS 体验中心 |
| **Playground** (page)            | Interactive TTS demo         | TTS 体验中心             | Not 操场                               |
| **Voices / Community Voices**    | Cloneable TTS voice profiles | 音色 / 社区音色          | Not 语音 (speech)                      |
| **Your Voice**                   | User’s selected/custom voice | 您的音色                 |                                        |
| **Voice synthesis / TTS**        | Spoken audio generation      | 语音合成                 | Feature copy on home page              |
| **Recording** (custom voice)     | User-recorded voice sample   | 录音                     | Distinct from 音色 (profile)           |
| **Generate Audio**               | TTS synthesis action         | 生成音频                 |                                        |
| **Job / queue** (playground)     | Async synthesis task         | 任务 / 排队              | Not employment “工作”                  |
| **Pricing** (nav)                | Plans page                   | 价格                     | Body may use 定价                      |
| **News**                         | Blog listing                 | 资讯                     |                                        |
| **Get Started**                  | Primary CTA                  | 开始使用                 |                                        |
| **Start Free Trial**             | Trial CTA                    | 开始免费试用             |                                        |
| **Free / Pro / Premium** (plans) | Tier names                   | 免费版 / 专业版 / 高级版 | Keep **Enterprise** as 企业版          |

### Cross-product alignment (Huavoi Studio)

| Concept                  | Landing (`zh-CN`)   | Studio app (`zh-CN`) |
| ------------------------ | ------------------- | -------------------- |
| Voices                   | 音色                | 音色                 |
| TTS / synthesis          | 语音合成            | 语音合成             |
| Playground               | 体验 / TTS 体验中心 | 试用场               |
| Credits (if added later) | —                   | 额度                 |

Studio uses workflow-oriented labels; the landing site uses shorter nav/marketing labels — but **core nouns must not contradict**.

---

## 5. UI-string rules

### Buttons and CTAs

- One clear action per button: `开始使用`, `开始免费试用`, `生成音频`.
- Loading states mirror the idle verb: `合成中...`, `正在上传录音...`.

### Marketing copy (home, pricing)

- **Headline**: benefit or category.
- **Subtitle**: one supporting sentence; don’t repeat the headline.
- Feature bullets: parallel structure within a section.
- Keep plan feature lists (`f1`–`f10`) grammatically parallel in each locale.

### Playground copy

- Errors name what failed and what to do next (`上传录音失败，请重试`).
- Status strings are short (`排队中`, `音频已就绪！`).
- Recording flow: distinguish **录音** (the act/file) from **音色** (the selectable voice).

### Placeholders and interpolation

Unlike Studio, this repo’s `t()` does **not** accept a second options argument. Dynamic values are substituted in component code via `.replace()`:

```tsx
t("playground.voicePromptLabel").replace("{id}", String(voiceId));
t("playground.voiceSection.uploadRateLimit").replace("{time}", formattedTime);
```

Rules for translators:

- Keep placeholder tokens **exactly** as in English: `{id}`, `{time}`, `{n}`, `{count}`, `{text}`, `{duration}`.
- You may move placeholders within the sentence for grammar.
- Do not rename or translate placeholder keys.
- Avoid splitting a placeholder across words.

Known placeholder keys (playground):

| Key                                       | Placeholders | Example (en)            |
| ----------------------------------------- | ------------ | ----------------------- |
| `playground.voiceSection.showAll`         | `{n}`        | Show all {n}            |
| `playground.voiceSection.uploadRateLimit` | `{time}`     | Try again in {time}     |
| `playground.voiceSection.deleteConfirm`   | `{id}`       | Delete Recording #{id}? |
| `playground.voicePromptLabel`             | `{id}`       | Recording #{id}         |
| `playground.historySection.deleteConfirm` | `{text}`     | …delete… "{text}"       |
| `playground.relativeTime.*`               | `{n}`        | {n}m ago                |

### Sample texts (`sample-texts.json`)

These are **demo scripts read aloud in the playground**. They should feel natural and entertaining in the target language — **rewrite for culture**, don’t translate English jokes literally.

- `playful`, `mockNews`, `curious`: comedic, conversational tone.
- Match approximate length (TTS works best with similar character counts).
- Use local cultural references where appropriate.

### Sample voices (`sample-voices.json`)

- **`name`**: keep as-is (product voice IDs / display names).
- **`gender`**: translate (`male` → 男声).
- **`preview`**: short style description (smooth, warm, etc.).

### Brand and proper nouns

- Keep **Huavoi**, plan tier names **Pro / Premium / Enterprise**, and third-party names unless marketing specifies otherwise.
- Trust-bar creator names stay in original form.

---

## 6. What not to do

1. **Machine-translate JSON or legal Markdown and ship** without a native pass on CTAs, playground actions, and errors.
2. **Mix synonyms** for the same concept (e.g. 语音 vs 音色 for voice profiles).
3. **Change JSON keys** — only values. Keys must match `en`.
4. **Drop keys** or leave `[TRANSLATE: ...]` placeholders in shipping locales.
5. **Translate blog post slugs** — URLs are English filenames under `content/posts/`.
6. **Break placeholder tokens** — QA for visible `{id}` or `{time}` in the UI.

---

## 7. File & workflow conventions

### JSON locales layout

```text
public/locales/
  en/                    # source of truth
  zh-CN/                 # reference localization
  {locale}/
    common.json          # shared CTAs
    header.json          # nav, theme, language
    home.json            # landing page
    pricing.json         # plans
    playground.json      # TTS demo (largest namespace)
    footer.json
    news.json            # news page chrome (not article bodies)
    legal.json           # legal page badges/labels
    sample-texts.json    # playground demo scripts
    sample-voices.json   # voice card metadata
```

Namespaces are loaded from `translationFiles` in `src/i18n/context.tsx`. A new namespace file must be added there.

### Legal Markdown layout

```text
content/legal/
  privacy/
    en.md
    zh-CN.md
    ...
  terms/
    en.md
    zh-CN.md
    ...
```

Each file uses front matter (`title`, `lastUpdated`) and Markdown body. Served via `/api/legal/{type}/{locale}`. If a locale file is missing, the API falls back to `en.md`.

Legal translation is **formal** and may diverge in structure from UI JSON — but product names and defined terms should still match the glossary.

### Locale codes

Registered in `src/i18n/config.ts`:

`en`, `zh-CN`, `zh-TW`, `ja`, `ko`, `de`, `fr`, `es` (BCP-47).

Legacy `localStorage` values `chs` / `cht` migrate to `zh-CN` / `zh-TW`.

### Adding a new locale (checklist)

1. Copy `public/locales/en/*.json` → `public/locales/{locale}/`.
2. Translate all values; keep key trees identical to `en`.
3. Add `content/legal/privacy/{locale}.md` and `content/legal/terms/{locale}.md` (or accept `en` fallback until ready).
4. Register locale in `src/i18n/config.ts` (`locales`, `localeNames`).
5. Language switcher in `Header.tsx` picks up `localeNames` automatically.
6. Native review: **header nav**, **home hero + CTAs**, **pricing tiers**, **playground record/generate flow**, **footer**.
7. Spot-check truncation in mobile nav and playground modals.

### Updating copy

1. Change `en` first when product meaning changes.
2. Update all locale JSON files in the same PR when possible.
3. For legal changes, update `en.md` and propagate to locale Markdown files.

---

## 8. Namespace reference

| Namespace       | Typical content                                                  |
| --------------- | ---------------------------------------------------------------- |
| `common`        | Shared CTAs: Get Started, Learn More, gender labels              |
| `header`        | Nav items, theme toggle, language menu                           |
| `home`          | Hero, features, solutions, trust section                         |
| `pricing`       | Plan names, features, billing toggle, FAQ                        |
| `playground`    | TTS demo: text editor, voices, recording, queue, history         |
| `footer`        | Links, copyright                                                 |
| `news`          | News page title, categories, newsletter — **not** article bodies |
| `legal`         | Loading states and badges for legal pages                        |
| `sample-texts`  | Playground demo scripts (culturally adapted)                     |
| `sample-voices` | Community voice card labels                                      |

---

## 9. Review rubric (PR / LQA)

- [ ] Glossary terms consistent across header, home, pricing, playground
- [ ] CTAs read as native marketing/UI, not calques
- [ ] Playground: 音色 vs 录音 vs 语音合成 used correctly
- [ ] All `{placeholder}` tokens preserved and substituted correctly in UI
- [ ] `sample-texts` sound natural when read aloud (not literal joke translation)
- [ ] JSON valid; key tree matches `en`
- [ ] Legal Markdown updated if terms/privacy meaning changed
- [ ] No `[TRANSLATE: ...]` left in non-English shipping locales

---

## 10. Locale-specific notes

### Simplified Chinese (`zh-CN`)

- Reference localization for glossary (see §4).
- Nav Playground: **体验**; page: **TTS 体验中心**.
- Voice profiles: **音色**; synthesis: **语音合成**.

### Traditional Chinese (`zh-TW`)

- Translate **from English**, not by converting `zh-CN`.
- Use Taiwan product phrasing (登入, 影片, 設定, 點數 if credits appear).
- Playground: 體驗 / TTS 體驗中心; voices: **音色**.

### Japanese / Korean / German / French / Spanish

- Lock glossary in the PR description before bulk translation.
- Check how local TTS/video SaaS sites label: trial demo, voice library, free trial.

### English (`en`)

- Source of truth for keys and meaning.
- Playground sample texts: conversational, slightly humorous — maintain that voice when adding new samples.

---

## 11. Engineering notes (for implementers)

- `t(key)` returns a string; missing keys fall back to `en`, then to the raw key.
- Use `.replace("{token}", value)` for dynamic playground strings — keep token names in sync with JSON.
- Do not hardcode user-visible English when a locale key exists.
- `resolveTtsLanguage()` in `config.ts` maps voice language to UI locale for API calls.
- Blog posts (`content/posts/`) are not locale-aware; only wrap UI in `news.json`.
- New namespaces: add to `translationFiles` in `src/i18n/context.tsx` and create files for every locale.

---

## 12. Quick examples

**Header nav**

- en: `Playground` / `Pricing` / `News`
- zh-CN: `体验` / `价格` / `资讯`

**Playground**

- en: `Community Voices` / `Generate Audio` / `Synthesizing...`
- zh-CN: `社区音色` / `生成音频` / `合成中...`

**Home CTA**

- en: `Get Started Free`
- zh-CN: `免费开始使用`

**Placeholder**

- en: `Upload limit reached. Try again in {time}.`
- zh-CN: `已达上传上限，请在 {time} 后重试。`

---

When in doubt: **sound like a native SaaS landing page and demo in that market, stay faithful to English meaning, and keep glossary terms consistent with Huavoi Studio where concepts overlap.**
