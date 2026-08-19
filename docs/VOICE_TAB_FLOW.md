# Voice Selection Modal - Tab Flow & State Management

## Tab States and Voice Selection

### Sample Voices Tab

```
State Required for Confirm Button:
✓ selectedVoice !== null
✓ activeVoicePanel === "stock"
✗ NOT recording
✗ NOT uploading

Actions:
- Select voice → setSelectedVoice(id), setActiveVoicePanel("stock")
- Switch away → Clear all voice state
```

### Start Recording Tab

```
State Required for Confirm Button:
✓ anonymousVoiceId !== null
✓ uploadStatus === "success"
✗ NOT recording
✗ NOT uploading

Actions:
- Record → Create blob
- Upload → Get anonymousVoiceId
- Switch away → Clear all voice state
```

### History Tab

```
State Required for Confirm Button:
✓ anonymousVoiceId !== null
✗ NOT recording
✗ NOT uploading

Actions:
- Select voice → setAnonymousVoiceId(id), setActiveVoicePanel("custom")
- Switch away → Clear all voice state
```

## Tab Switching Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    User Clicks Tab Button                    │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              handleTabChange(newTab) called                  │
│                                                              │
│  1. Check if activeTab === newTab → Return early            │
│  2. Call onClearSampleVoice() callback                      │
│  3. setActiveTab(newTab)                                     │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│             onClearSampleVoice() in Parent                   │
│                                                              │
│  Clear Sample Voice:                                         │
│    - setSelectedVoice(null)                                  │
│                                                              │
│  Clear Custom Voice:                                         │
│    - setAnonymousVoiceId(null)                               │
│    - setRecordedAudioBlob(null)                              │
│    - setRecordedAudioUrl(null)                               │
│    - setUploadStatus("idle")                                 │
│    - setUploadError(null)                                    │
│                                                              │
│  Stop All Audio:                                             │
│    - voicePreviewRef.current?.pause()                        │
│    - recAudioRef.current?.pause()                            │
│    - setPlayingVoicePreview(null)                            │
│    - setIsRecPlaying(false)                                  │
│    - setPlayingHistoryVoiceId(null)                          │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   New Tab Rendered                           │
│                                                              │
│  Confirm Button Hidden (no voice selected)                  │
│  User starts fresh in new tab                               │
└─────────────────────────────────────────────────────────────┘
```

## Confirm Button Visibility Logic

```javascript
const hasSampleVoice = activeTab === "sample" && selectedVoice && activeVoicePanel === "stock";

const hasCustomVoice =
  (activeTab === "record" && anonymousVoiceId && uploadStatus === "success") ||
  (activeTab === "history" && anonymousVoiceId);

const isProcessing = isRecording || uploadStatus === "uploading";

const shouldShowConfirm = (hasSampleVoice || hasCustomVoice) && !isProcessing;
```

## Audio Playback Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Audio System Overview                      │
└──────────────────────────────────────────────────────────────┘

1. TTS Playback (audioRef)
   └─ Plays: Generated TTS audio from backend
   └─ Controlled by: isPlaying, togglePlayback()
   └─ Source: audioUrl

2. Recording Playback (recAudioRef)
   └─ Plays: User's recorded voice
   └─ Controlled by: isRecPlaying, toggleRecPlayback()
   └─ Source: recordedAudioUrl
   └─ Element: <audio ref={recAudioRef} src={recordedAudioUrl} />

3. Voice Preview (voicePreviewRef)
   └─ Plays: Sample voices & history voices
   └─ Controlled by: playingVoicePreview, playingHistoryVoiceId
   └─ Source: Dynamic (voice.localAudioFile or API endpoint)

All three are mutually exclusive via stopAllOtherAudio()
```

## State Dependencies

```
Voice Selection State:
├─ selectedVoice (string | null)
│  └─ Used when: activeVoicePanel === "stock"
│  └─ Cleared when: Switching tabs, recording, selecting history
│
├─ anonymousVoiceId (number | null)
│  └─ Used when: activeVoicePanel === "custom"
│  └─ Set by: Upload success, selecting history
│  └─ Cleared when: Switching tabs, resetting recording
│
├─ activeVoicePanel ("stock" | "custom")
│  └─ Determines: Which voice system is active
│  └─ Set by: Voice selection actions
│
├─ recordedAudioBlob (Blob | null)
│  └─ Exists when: User just recorded audio
│  └─ Cleared when: Switching tabs, resetting
│
└─ uploadStatus ("idle" | "uploading" | "success" | "error")
   └─ Tracks: Upload progress
   └─ Affects: Confirm button visibility
```

## Issue Root Causes & Solutions

### Issue 1: PlayIcon Not Working

**Root Cause**:

- VoiceRecorder had local `isPlayingRecording` state
- This local state wasn't synced with parent's `isRecPlaying`
- When coming from history tab, local state was false but prop wasn't used

**Solution**:

- Removed local `isPlayingRecording` state
- Now uses `isPlayingRecording` prop directly (which is parent's `isRecPlaying`)

### Issue 2: Confirm Button Appearing Incorrectly

**Root Cause**:

- Logic only checked `selectedVoice || anonymousVoiceId`
- Didn't consider which tab was active
- Didn't check if voice was valid for current context

**Solution**:

- Added tab-aware logic
- Check voice state matches current tab
- Verify upload status for recorded voices

### Issue 3: Voice Persisting Across Tabs

**Root Cause**:

- No cleanup when switching tabs
- State from one tab leaked into another
- Caused confusion about which voice was selected

**Solution**:

- Added `handleTabChange` with cleanup
- Clear all voice state on tab switch
- Fresh start in each tab
