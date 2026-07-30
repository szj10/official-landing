/**
 * Playground Voice Configuration
 * ================================
 * Edit this file to add, remove, or modify voices shown in the TTS playground.
 *
 * Each voice needs:
 *   - id            : Unique frontend identifier string (e.g. "voice1")
 *   - backendVoiceId: INTEGER primary key from voice.voices table in the backend DB
 *   - language      : Language code matching voice.language in the DB (e.g. "zh", "en")
 *   - localAudioFile: Path under /public/ for the instant browser preview
 *                     (copy the wav from MinIO to /public/audio_prompts/<filename>)
 *   - nameKey       : i18n translation key for the display name
 *   - genderKey     : i18n translation key for gender label
 *   - accentKey     : i18n translation key for accent/style label
 *   - previewKey    : i18n translation key for short description
 *   - color         : Tailwind gradient classes for the avatar circle
 *   - avatar        : Single letter shown inside the avatar circle
 *
 * Translation keys live in /public/locales/<locale>/playground.json
 * under the "sampleVoices" namespace (voice1, voice2, …).
 *
 * ⚠️  The voice must have is_shared=true AND is_approved=true in the backend
 *     for the TTS generation call to succeed (rate-limiting aside).
 */

export interface PlaygroundVoice {
  id: string;
  backendVoiceId: number;
  language: string;
  localAudioFile: string;
  nameKey: string;
  genderKey: string;
  accentKey: string;
  previewKey: string;
  color: string;
  avatar: string;
}

// ---------------------------------------------------------------------------
// ✏️  EDIT HERE — add / remove / reorder voices as needed
// ---------------------------------------------------------------------------
export const PLAYGROUND_VOICES: PlaygroundVoice[] = [
  {
    id: "voice1",
    // DB id=105 | name="lakesys" | lang=zh | is_shared=false | is_approved=false
    backendVoiceId: 105,
    language: "zh",
    localAudioFile: "/audio_prompts/lakesys.wav",
    nameKey: "playground.sampleVoices.voice1.name",
    genderKey: "playground.sampleVoices.voice1.gender",
    accentKey: "playground.sampleVoices.voice1.accent",
    previewKey: "playground.sampleVoices.voice1.preview",
    color: "from-pink-500 to-rose-500",
    avatar: "L",
  },
  {
    id: "voice2",
    // DB id=106 | name="hef" | lang=zh | is_shared=false | is_approved=false
    backendVoiceId: 106,
    language: "zh",
    localAudioFile: "/audio_prompts/hef.wav",
    nameKey: "playground.sampleVoices.voice2.name",
    genderKey: "playground.sampleVoices.voice2.gender",
    accentKey: "playground.sampleVoices.voice2.accent",
    previewKey: "playground.sampleVoices.voice2.preview",
    color: "from-blue-500 to-indigo-500",
    avatar: "H",
  },
  {
    id: "voice3",
    // DB id=108 | name="andhelo" | lang=zh | is_shared=true | is_approved=false | is_deleted=true ⚠️
    backendVoiceId: 108,
    language: "zh",
    localAudioFile: "/audio_prompts/andhelo.wav",
    nameKey: "playground.sampleVoices.voice3.name",
    genderKey: "playground.sampleVoices.voice3.gender",
    accentKey: "playground.sampleVoices.voice3.accent",
    previewKey: "playground.sampleVoices.voice3.preview",
    color: "from-purple-500 to-violet-500",
    avatar: "A",
  },
  {
    id: "voice4",
    // DB id=104 | name="whaat goina be" | lang=zh | is_shared=false | is_approved=false | is_deleted=true ⚠️
    backendVoiceId: 104,
    language: "zh",
    localAudioFile: "/audio_prompts/whaat-goina-be.wav",
    nameKey: "playground.sampleVoices.voice4.name",
    genderKey: "playground.sampleVoices.voice4.gender",
    accentKey: "playground.sampleVoices.voice4.accent",
    previewKey: "playground.sampleVoices.voice4.preview",
    color: "from-emerald-500 to-teal-500",
    avatar: "W",
  },
];
