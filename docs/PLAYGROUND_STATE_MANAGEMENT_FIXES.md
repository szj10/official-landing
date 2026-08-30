# Playground State Management — Potential Fixes

Documentation for known coordination gaps and edge-case bugs in the public TTS playground state layer.  
Scope: orchestrator + custom hooks introduced when `PlaygroundContent.tsx` was split into domain hooks.

**Related docs**

| Document                                             | Purpose                                                                     |
| ---------------------------------------------------- | --------------------------------------------------------------------------- |
| [PLAYGROUND_FOLLOWUPS.md](./PLAYGROUND_FOLLOWUPS.md) | Broader playground backlog (polling, history hydrate, a11y, modal refactor) |
| [VOICE_TAB_FLOW.md](./VOICE_TAB_FLOW.md)             | Voice modal tab rules and confirm-button gating                             |

**Primary files**

| Path                                               | Role                                            |
| -------------------------------------------------- | ----------------------------------------------- |
| `src/app/playground/PlaygroundContent.tsx`         | Orchestrator: local UI state + hook wiring      |
| `src/app/playground/hooks/usePlaygroundHistory.ts` | Voice/job history hydrate + localStorage        |
| `src/app/playground/hooks/usePlaygroundAudio.ts`   | Sticky player, previews, history playback       |
| `src/app/playground/hooks/usePlaygroundVoice.ts`   | Stock/custom voice selection, recording, upload |
| `src/app/playground/hooks/useTtsGeneration.ts`     | TTS POST, polling, pending-job resume           |
| `src/app/playground/lib/historyStorage.ts`         | localStorage keys + hydrate helpers             |

---

## Architecture (current)

`PlaygroundContent` owns **UI-only** state (modal, text, speed, stock-voice fetch, history accordion). Domain state lives in four hooks, connected via callbacks:

```
PlaygroundContent
├── usePlaygroundHistory()     → historyVoices, historyJobs, hydrated
├── usePlaygroundAudio({ currentJobAudioPathRef, stockVoices })
├── usePlaygroundVoice({ onPrependHistoryVoice, onRecordingStart, onRecordingReady })
└── useTtsGeneration({ textInput, speed, voice state, historyHydrated, callbacks })
```

**Intentional patterns**

- `currentJobAudioPathRef` — audio hook reads latest TTS job path without re-subscribing to job state.
- `history.hydrated` gate — pending-job resume runs only after history hydrate completes (avoids race with `setHistoryJobs`).
- `writePendingJob` / `readPendingJob` — snapshots text + voice at generation time so polling completion uses stable context even though `setInterval` captures a stale `fetchJobStatus` closure.

This split is sound; the items below are **coordination gaps** between hooks, not a reason to collapse everything back into one component.

---

## Fix backlog

Priority legend: **P1** = user-visible bug or wrong UI; **P2** = inconsistency / maintainability; **P3** = cleanup or product decision.

### P1-1 — Sticky subtitle shows wrong voice after new generation

**Symptom**  
User plays a job from **Generation History**, then clicks **Generate & play**. Audio plays the new synthesis, but the inline player subtitle still shows the **history job’s voice name**.

**Root cause**  
`playingHistoryJobId` stays set when a new TTS run starts. `deriveStickySubtitle()` in `PlaygroundContent.tsx` checks `playingHistoryJobId` before current voice state:

```ts
if (playingHistoryJobId != null) {
  const hj = history.historyJobs.find((j) => j.playground_job_id === playingHistoryJobId);
  if (hj) return hj.voice_name;
}
```

`onTtsStart` (called from `useTtsGeneration.resetGenerationState`) pauses TTS audio but does **not** clear `playingHistoryJobId`.

**Affected files**

- `src/app/playground/hooks/usePlaygroundAudio.ts` — `onTtsStart`, optionally `playGeneratedAudio`
- `src/app/playground/PlaygroundContent.tsx` — `deriveStickySubtitle` (verify after fix)

**Proposed fix**

1. In `onTtsStart`, add `setPlayingHistoryJobId(null)`.
2. Optionally also clear in `playGeneratedAudio` when setting new `audioUrl` (belt-and-suspenders).

**Verification**

1. Complete a TTS job; open history; play an older entry.
2. Change text; generate again.
3. Subtitle should reflect the **current** stock or custom voice, not the history entry.

**Related**  
[PLAYGROUND_FOLLOWUPS.md §2](./PLAYGROUND_FOLLOWUPS.md) — optional refactor to consolidate `playingHistoryJobId` / `playingHistoryVoiceId`.

---

### P1-2 — Reset recording leaves stale sticky player visible

**Symptom**  
In the voice modal, user records audio, hears playback in the sticky/inline player, then taps **reset**. Voice UI resets to stock, but the recording player can remain visible or replay old audio.

**Root cause**  
`onResetRecording` in `PlaygroundContent.tsx` calls `stopRecordingPlayback()` and `voice.resetRecording(...)`, but never clears `recordedAudioUrl` in the audio hook. `resetRecording` clears `recordedAudioBlob` and voice IDs only.

Sticky visibility is:

```ts
activeStickyPlayer === "rec" && !!recordedAudioUrl;
```

**Affected files**

- `src/app/playground/PlaygroundContent.tsx` — `onResetRecording` handler
- `src/app/playground/hooks/usePlaygroundAudio.ts` — `clearRecordedAudio` (already exists)
- `src/app/playground/hooks/usePlaygroundVoice.ts` — `resetRecording` (optional: document that URL cleanup is orchestrator’s job)

**Proposed fix**

In `onResetRecording`:

```ts
onResetRecording={() => {
  stopRecordingPlayback();
  clearRecordedAudio(); // from usePlaygroundAudio
  voice.resetRecording(stockVoices[0]?.id ?? null);
}}
```

Destructure `clearRecordedAudio` from `usePlaygroundAudio` if not already exposed to the component.

**Verification**

1. Record → autoplay starts → open modal → reset.
2. Inline recording player should hide; no blob URL leak (check Network / memory: old blob URL revoked).

---

### P1-3 — Instant (cached) completion skips completion card

**Symptom**  
When the backend returns `status: "completed"` immediately on POST (cache hit), queue UI may not show the **completed** state on `QueueStatusCard`, while jobs that complete via polling do.

**Root cause**  
`handleJobUpdate` (polling path) calls `setShowCompletionCard(true)`. `handleJobResponse` (immediate completion path) returns early without setting it:

```ts
if (job.status === "completed" && job.audio_path) {
  onJobComplete(job);
  setIsGenerating(false);
  saveCompletedJob(job);
  clearPendingJob();
  return; // missing setShowCompletionCard(true)
}
```

**Affected files**

- `src/app/playground/hooks/useTtsGeneration.ts` — `handleJobResponse`

**Proposed fix**

Add `setShowCompletionCard(true)` before `return` in the immediate-completion branch (mirror polling behavior).

**Verification**

1. Trigger a generation that returns completed on first POST (same text/voice as a recent job if caching applies).
2. `QueueStatusCard` should show the same completion treatment as a polled job.

---

### P2-1 — Selecting history voice does not stop stock preview

**Symptom**  
Stock voice preview (`new Audio` via `handleVoicePreview`) can keep playing after user selects a **history voice** in the modal or header.

**Root cause**  
`handleSelectHistoryVoice` updates voice state and `setRecordedUrl`, but does not call `silenceAllAudio` or `clearVoicePreview`.

**Affected files**

- `src/app/playground/PlaygroundContent.tsx` — `handleSelectHistoryVoice`

**Proposed fix**

```ts
const handleSelectHistoryVoice = (item: HistoryVoice) => {
  clearVoicePreview(); // or silenceAllAudio() if full mute is desired
  voice.selectHistoryVoice(item);
  setRecordedUrl(historyVoicePromptUrl(item.anonymous_voice_id));
};
```

Prefer `clearVoicePreview()` if recording URL should not be cleared; use `silenceAllAudio()` only when switching should hide the sticky bar entirely.

**Verification**

1. Preview a stock voice (grid play icon).
2. Select a history voice without closing preview manually.
3. Preview audio should stop; `playingVoicePreview` should be `null`.

---

### P2-2 — Locale change always forces stock panel

**Symptom**  
User has a valid **custom** or **history** voice selected. Changing site language switches `activeVoicePanel` to `"stock"` even when `anonymousVoiceId` is still valid.

**Root cause**  
Community-voice `useEffect` in `PlaygroundContent.tsx` always runs `voice.setActiveVoicePanel("stock")` after a successful fetch.

**Affected files**

- `src/app/playground/PlaygroundContent.tsx` — locale `useEffect` (~lines 115–152)

**Proposed fix (product-dependent)**

**Option A — Preserve custom voice (recommended if uploads are language-agnostic)**  
Only adjust stock selection; do not force panel:

```ts
if (mapped.length > 0) {
  voice.setSelectedVoice((prev) => {
    /* existing logic */
  });
  // Only switch to stock if user was on stock and selection became invalid
  if (voice.activeVoicePanel === "stock") {
    voice.setActiveVoicePanel("stock");
  }
}
```

**Option B — Intentional reset**  
Keep current behavior; document in UI copy that changing language resets voice to community defaults.

**Verification**

1. Upload or pick history voice; switch locale.
2. Confirm behavior matches chosen product rule.

---

### P2-3 — Resume-on-refresh may save wrong voice label

**Symptom**  
After page refresh, a pending job that **completed while away** may appear in history with a generic voice name (e.g. “Custom voice”) instead of the stock voice display name.

**Root cause**  
Resume effect in `useTtsGeneration` runs when `historyHydrated` becomes true. `saveCompletedJob` resolves stock names via `stockVoices.find(...)`, but the community-voice fetch in `PlaygroundContent` may still be in flight (`stockVoicesLoading === true`, `stockVoices === []`).

**Affected files**

- `src/app/playground/hooks/useTtsGeneration.ts` — resume `useEffect`
- `src/app/playground/PlaygroundContent.tsx` — stock voice loading

**Proposed fix (pick one)**

1. **Defer resume save until voices loaded** — gate resume completion handling on `!stockVoicesLoading` (pass flag into hook or move resume orchestration to `PlaygroundContent`).
2. **Persist display name in pending job** — extend `PendingJobContext` in `historyStorage.ts` with optional `voice_name` at `writePendingJob` time.
3. **Reconcile history entry** — when `stockVoices` arrives, patch matching `historyJobs` entries missing a proper `voice_name`.

Option 2 is the most robust (display name survives even if stock list changes).

**Verification**

1. Start generation with a named stock voice; refresh before completion.
2. Let job finish; history row should show correct voice label.

---

### P2-4 — Polling closure fallback without pending context

**Symptom**  
Rare: completed job saved to history with wrong text snippet or voice metadata if `readPendingJob()` returns null or incomplete data.

**Root cause**  
`setInterval` in `pollJobStatus` holds the `fetchJobStatus` function from the render when polling started. `saveCompletedJob` without `contextOverride` reads live `textInput`, `selectedVoice`, etc. from that stale closure. Normal flow mitigates this via `writePendingJob` at job start; legacy/plain pending IDs may not.

**Affected files**

- `src/app/playground/hooks/useTtsGeneration.ts` — `pollJobStatus`, `saveCompletedJob`
- `src/app/playground/lib/historyStorage.ts` — `readPendingJob` legacy shape

**Proposed fix**

1. Always require pending context for in-flight jobs (assert or log if missing on completion).
2. Refactor polling to use refs for latest context (`jobContextRef.current = { textInput, ... }` updated each render) instead of closure capture.
3. Migrate legacy `PENDING_JOB_KEY` values to full `PendingJobContext` on read.

**Verification**

1. Start job; change text in editor before completion; history snippet should still reflect **submitted** text (pending snapshot), not edited text.
2. Complete job with only legacy pending id in localStorage; should not corrupt history.

---

### P2-5 — Delete history voice requires three coordinated calls

**Symptom**  
Not a current user bug if all call sites use the orchestrator helpers — but new delete paths (e.g. another component) can easily update only one layer.

**Root cause**  
Voice deletion is split across hooks with no single entry point:

```ts
handleHistoryVoiceDeleted(voiceId); // audio
voice.handleHistoryVoiceDeleted(voiceId); // voice selection
history.removeHistoryVoice(voiceId); // persistence
```

**Affected files**

- `src/app/playground/PlaygroundContent.tsx`
- Optionally new `src/app/playground/hooks/usePlaygroundActions.ts` (facade)

**Proposed fix**

Introduce a small facade hook or module:

```ts
function usePlaygroundActions({ audio, voice, history }) {
  return {
    deleteHistoryVoice: (id) => {
      /* all three */
    },
    deleteHistoryJob: (id) => {
      /* audio + history */
    },
    selectHistoryVoice: (item) => {
      /* preview + voice + url */
    },
  };
}
```

Keep `PlaygroundContent` as the composition root; children receive stable callbacks from the facade.

**Verification**

- Grep for `removeHistoryVoice` / `handleHistoryVoiceDeleted` — all deletes should go through one function.

---

### P3-1 — Unused `queueRef`

**Symptom**  
None (dead code).

**Root cause**  
`queueRef` is attached to the history accordion container but nothing calls `scrollIntoView` or similar.

**Affected files**

- `src/app/playground/PlaygroundContent.tsx`

**Proposed fix**

Either:

- **Remove** `queueRef` if scroll-on-complete is not desired, or
- **Wire** `onJobComplete` to `queueRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })` when opening history (product UX).

---

### P3-2 — Suppressed `exhaustive-deps` on locale effect

**Symptom**  
None today; risk on future edits.

**Root cause**  
Locale `useEffect` calls `voice.setSelectedVoice` / `setActiveVoicePanel` but only lists `[locale]` in deps (eslint disabled).

**Proposed fix**

- Destructure stable setters at hook return (`setSelectedVoice`, `setActiveVoicePanel`) and include them in deps, or
- Move stock-voice fetch + default selection into `usePlaygroundVoice` / dedicated `useStockVoices(locale)` hook so the effect lives next to the state it mutates.

---

## Suggested implementation order

| Order | ID         | Effort | Impact                        |
| ----- | ---------- | ------ | ----------------------------- |
| 1     | P1-1       | Small  | Wrong subtitle after generate |
| 2     | P1-2       | Small  | Stale player after reset      |
| 3     | P1-3       | Small  | Missing completion card       |
| 4     | P2-1       | Small  | Overlapping audio             |
| 5     | P2-3       | Medium | Wrong labels after refresh    |
| 6     | P2-4       | Medium | Rare history corruption       |
| 7     | P2-5       | Medium | Maintainability               |
| 8     | P2-2       | Small  | Product decision              |
| 9     | P3-1, P3-2 | Small  | Cleanup                       |

---

## Testing checklist (manual)

Use these after applying fixes:

- [ ] Stock voice → generate → sticky plays with correct subtitle
- [ ] History job play → generate again → subtitle updates
- [ ] Record → reset → no sticky rec player; blob revoked
- [ ] Cached/instant TTS completion → completion card visible
- [ ] Preview stock voice → select history voice → preview stops
- [ ] Delete history voice while selected → voice panel + audio + storage consistent
- [ ] Delete history job while playing → falls back to current job audio or hides player
- [ ] Refresh mid-job → resume polls; history label correct
- [ ] Change locale with custom voice → behavior matches product rule (P2-2)

---

## Out of scope (tracked elsewhere)

These are **not** duplicates of the fixes above; see [PLAYGROUND_FOLLOWUPS.md](./PLAYGROUND_FOLLOWUPS.md):

- Purge stale history entries on hydrate (backend 404 / missing IDs)
- Keyboard-accessible seek on sticky/inline player
- Thin `VoiceSelectionModal` / reduce prop drilling
- Consolidate `playingHistoryJobId` / `playingHistoryVoiceId` long-term (overlaps P1-1 motivation)

---

_Last reviewed: 2026-08-30 — based on `PlaygroundContent.tsx` orchestrator + four playground hooks._
