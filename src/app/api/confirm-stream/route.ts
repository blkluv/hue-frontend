import { config } from "@/config";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { trackId } = body;

    if (!trackId) {
      return NextResponse.json(
        { error: "trackId is required" },
        { status: 400 }
      );
    }

    // Forward to backend
    const response = await fetch(
      `http://${config.backend_endpoint}:11112/confirm-stream`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ trackId }),
      }
    );

    if (!response.ok) {
      throw new Error("Backend stream confirmation failed");
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Stream confirmation error:", error);
    return NextResponse.json(
      { error: "Failed to confirm stream" },
      { status: 500 }
    );
  }
}
