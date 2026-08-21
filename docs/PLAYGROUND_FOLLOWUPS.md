# Playground Follow-ups

Analysis and TODO backlog for the public TTS playground in `official-landing`.  
Scope: **remaining** issues only (as of 2026-08-22). Already-resolved items (char-limit validation, queue metrics UI, duration reject-on-fail, explicit audio bucket, GET/SSE `audio_duration` parity, rate-limit banners, dark mode / mobile layout, dead `eventSourceRef`, `currentText` alias) are intentionally omitted.

Primary surface:

| Path                                                    | Role                                                                    |
| ------------------------------------------------------- | ----------------------------------------------------------------------- |
| `src/app/playground/PlaygroundContent.tsx`              | Orchestrator (~1.2k LOC): state, upload, generate, poll, history, audio |
| `src/app/playground/components/StickyPlayerBar.tsx`     | Bottom sticky TTS / history player                                      |
| `src/app/playground/components/VoiceSelectionModal.tsx` | Voice tabs + speed (~30 props)                                          |
| `src/app/playground/components/VoiceGrid.tsx`           | Stock voice grid                                                        |
| `src/app/playground/components/VoiceRecorder.tsx`       | Record / upload UI                                                      |
| `src/app/playground/components/QueueStatusCard.tsx`     | Queue + completion card                                                 |
| `src/app/playground/components/HistoryJobs.tsx`         | History list playback                                                   |

**Current contract (do not “fix” back to old rules):**

- Text limit is **characters**, default **600** (`NEXT_PUBLIC_MAX_TTS_TEXT_LENGTH` / backend `MAX_TTS_TEXT_LENGTH`), not 200 words.
- Job tracking is **HTTP polling** every 1s (`pollJobStatus` → `fetchJobStatus`), not SSE.
- Queue position / estimated wait are already shown via `lastQueueMetrics` → `QueueStatusCard`.
- History expiry is driven by backend `expires_at` (typically ~24h), not a hardcoded client TTL.

---

## Analysis

### 1. Fragile sticky autoplay

When a TTS job completes, sticky playback starts with a fixed delay:

```tsx
// PlaygroundContent.tsx — showCompletionCard effect
setTimeout(() => { audioRef.current?.play()... }, 150);
```

History playback uses a similar `setTimeout(..., 50)`. On slow networks or cold cache, the `<audio>` element may not be ready; `play()` fails silently (caught / warned). Prefer media events (`canplay` / `loadedmetadata`) with a one-shot listener and cleanup.

### 2. Redundant playback identity state

`playingHistoryJobId` and `playingHistoryVoiceId` are separate React state, threaded through `HistoryJobs`, `QueueStatusCard`, `VoiceSelectionModal`, and `VoiceRecorder`. They largely encode “which history item owns the current preview / sticky play,” overlapping with `audioUrl`, `activeStickyPlayer`, and preview refs. Extra setters increase desync risk when stopping or switching sources.

### 3. Preview `Audio` objects are not disposed

`handleVoicePreview` / `playHistoryVoice` call `stopAllOtherAudio("preview")`, then assign `voicePreviewRef.current = new Audio(...)`. The previous instance is paused at best; `src` is not cleared and listeners are not removed. Under rapid voice switching this can leave orphaned media elements until GC.

### 4. Upload / poll error recovery is thin

- ~~`uploadRecordingToBackend`: single POST; failure sets `uploadError` with no retry control (beyond the user re-recording / re-triggering upload).~~ **Done:** non-429 failures show Retry that reuses the last Blob + duration; 429 rate-limit path unchanged (no retry).
- ~~`fetchJobStatus`: non-OK (except 429) returns quietly; network errors only `console.error`. No backoff, no user-visible “polling failed / retry” path while `isGenerating` stays true or stuck.~~ **Done:** after 5 consecutive poll failures (or immediate on 404), stop polling and show a connection-error banner with Retry.

### 5. History hydrate keeps stale local jobs

On load, local TTS IDs are filtered by `expires_at`, then merged with `/history/tts`. Jobs missing from the backend are **kept** if local `audio_path !== null`. Pending-job 404 clears storage but only logs — no banner. Users can see history entries that no longer resolve to playable audio.

### 6. Sticky seek bar accessibility

`StickyPlayerBar` has `aria-label` on play/pause/close. The progress track is a clickable `div` only (`onSeek` mouse click). Missing: `role="slider"`, keyboard handlers (Space/Enter play-pause already on button; arrows for seek), `tabIndex`, `aria-valuenow` / `aria-valuemin` / `aria-valuemax`.

### 7. Voice modal still a prop hub

`VoiceGrid` and `VoiceRecorder` are extracted, but `VoiceSelectionModal` still accepts ~30 props and owns tab chrome + speed. Hard to unit-test tab rules without mounting the full playground tree. See also `docs/VOICE_TAB_FLOW.md`.

---

## TODO

### P1 — Reliability

- [ ] **Event-driven sticky autoplay**  
      Replace `setTimeout(150)` (and history `50ms`) with `canplay` / `loadedmetadata` (or `play()` after `load()` with abortable listener). Ensure cleanup on unmount / URL change.

- [x] **Upload retry UX**  
      On non-429 upload failure, offer retry that reuses the last `Blob` + duration (no re-record). Keep rate-limit path as-is.

- [x] **Polling failure visibility**  
      After N consecutive poll failures, surface an error (or “connection issue — retry”) and stop the interval; optional exponential backoff instead of fixed 1s forever.

### P2 — Correctness & cleanup

- [ ] **Dispose preview audio**  
      Before reassigning `voicePreviewRef`, `pause()`, clear `src`, remove `onended` / `onerror`, set ref to `null`.

- [ ] **Purge stale history on hydrate**  
      Drop local jobs whose IDs are absent from the history API response (or whose audio URL 404s). On pending-job not found, show a short banner in addition to clearing `playground_pending_job`.

- [ ] **Simplify playback identity state** (optional refactor)  
      Derive or consolidate `playingHistoryJobId` / `playingHistoryVoiceId` so stop/switch paths cannot leave mismatched UI highlights.

### P3 — A11y & maintainability

- [ ] **Keyboard seek on sticky player**  
      Make the scrubber a proper slider; Space already on play button; Left/Right seek by a few seconds.

- [ ] **Thin `VoiceSelectionModal`**  
      Colocate tab state closer to children, or introduce a small context for voice-session state so the modal is layout + confirm only.

- [ ] **Analytics (optional)**  
      Track generate success / failure / rate-limit / upload failure if product wants funnel metrics.

---

## Related backend follow-ups (`studio-backend`)

Not in this repo, but relevant to the same playground product:

| Item                                   | Notes                                                                                                                                                                                   |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Remove deprecated `check_rate_limit()` | Dead DB-based helpers in `app/routers/playground.py` and unused `app/services/playground_tts.py`; live path is Valkey (`check_rate_limit_tts_ip` / `check_rate_limit_audio_prompt_ip`). |
| SSE `QueueCalculator()` DI             | `GET /tts/{job_id}` uses `Depends(get_queue_calculator)`; SSE stream still constructs `QueueCalculator()` inline. Align if SSE remains supported for other clients.                     |
| Stale “200 words” comments             | Code enforces character max; leftover comments/constants/tests wording should match `MAX_TTS_TEXT_LENGTH`.                                                                              |

Admin Studio playground UI lives in **studio-web**, not here — track admin queue/player UX there.

---

## Out of scope for this backlog

Do **not** reopen these as landing bugs (already handled):

- Max text length enforcement (frontend + backend characters)
- Queue metrics display on the public playground
- Backend audio duration: reject when unknown (no 1.0s fake duration)
- Explicit `bucket` on playground audio fetch
- `audio_duration` on job GET (and SSE payloads where used)
- Rate-limit user messaging (`AlertBanner`)
- Dark mode / responsive sticky layout
- Dead `eventSourceRef` SSE leftover (removed; polling only)
- `currentText` alias (removed; `saveCompletedJob` uses `textInput` directly)
