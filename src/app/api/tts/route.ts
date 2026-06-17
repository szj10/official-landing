import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const text = formData.get("text") as string;
    const voiceId = formData.get("voiceId") as string | null;
    const voiceSample = formData.get("voiceSample") as File | null;

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    if (!voiceId && !voiceSample) {
      return NextResponse.json({ error: "Voice ID or voice sample is required" }, { status: 400 });
    }

    const backendUrl = process.env.TTS_BACKEND_URL || "http://localhost:8000";

    const backendFormData = new FormData();
    backendFormData.append("text", text);

    if (voiceId) {
      backendFormData.append("voice_id", voiceId);
    }

    if (voiceSample) {
      const arrayBuffer = await voiceSample.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const blob = new Blob([buffer], { type: voiceSample.type });
      backendFormData.append("voice_sample", blob, voiceSample.name);
    }

    const response = await fetch(`${backendUrl}/api/tts/generate`, {
      method: "POST",
      body: backendFormData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("TTS backend error:", errorData);
      return NextResponse.json(
        { error: "Failed to generate audio from TTS service" },
        { status: response.status }
      );
    }

    const audioBuffer = await response.arrayBuffer();

    const base64Audio = Buffer.from(audioBuffer).toString("base64");
    const audioUrl = `data:audio/mp3;base64,${base64Audio}`;

    return NextResponse.json({
      success: true,
      audioUrl,
      message: "Audio generated successfully",
    });
  } catch (error) {
    console.error("TTS API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
