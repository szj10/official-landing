import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const voiceId = searchParams.get("voiceId");

    if (!voiceId) {
      return NextResponse.json({ error: "Voice ID is required" }, { status: 400 });
    }

    const backendUrl = process.env.TTS_BACKEND_URL || "http://localhost:8000";

    const sampleText = "Hello, this is a preview of my voice.";

    const response = await fetch(`${backendUrl}/api/tts/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: sampleText,
        voice_id: voiceId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("TTS preview error:", errorData);
      return NextResponse.json(
        { error: "Failed to generate voice preview" },
        { status: response.status }
      );
    }

    const audioBuffer = await response.arrayBuffer();

    const base64Audio = Buffer.from(audioBuffer).toString("base64");
    const audioUrl = `data:audio/mp3;base64,${base64Audio}`;

    return NextResponse.json({
      success: true,
      audioUrl,
      message: "Voice preview generated successfully",
    });
  } catch (error) {
    console.error("Voice preview API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
