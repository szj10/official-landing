/**
 * Playground Voice Types and Helpers
 * ===================================
 * Community voices are fetched dynamically from GET /api/v1/voices/community.
 */

export interface BackendCommunityVoice {
  id: number;
  name: string;
  audio_path: string;
  mime_type: string;
  language: string | null;
  duration_seconds: number | null;
  user_id: number;
  is_shared: boolean;
  is_approved: boolean;
  is_deleted: boolean;
  creator_username: string;
  creator_avatar_url: string | null;
  audio_url: string | null;
  admin_approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlaygroundVoice {
  id: string;
  backendVoiceId: number;
  name: string;
  nameKey?: string;
  language: string;
  audioUrl: string;
  gender?: "male" | "female";
  previewKey?: string;
  color: string;
  avatar: string;
  avatarUrl?: string | null;
  creatorUsername?: string;
}

export const VOICE_GRADIENTS = [
  "from-pink-500 to-rose-500",
  "from-blue-500 to-indigo-500",
  "from-purple-500 to-violet-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-cyan-500 to-blue-600",
  "from-fuchsia-500 to-pink-600",
  "from-violet-500 to-purple-600",
];

export function mapCommunityVoiceToPlaygroundVoice(
  v: BackendCommunityVoice,
  index: number
): PlaygroundVoice {
  const name = v.name || `Voice ${v.id}`;
  const firstLetter = name.trim().charAt(0).toUpperCase() || "V";
  const color = VOICE_GRADIENTS[index % VOICE_GRADIENTS.length];
  const audioUrl = v.audio_url || `/api/v1/playground/audio/${v.audio_path}?bucket=storage`;

  return {
    id: String(v.id),
    backendVoiceId: v.id,
    name: name,
    language: v.language || "en",
    audioUrl: audioUrl,
    color: color,
    avatar: firstLetter,
    avatarUrl: v.creator_avatar_url || null,
    creatorUsername: v.creator_username,
  };
}
