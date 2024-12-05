import { config } from "@/config";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const trackId = searchParams.get("trackId");
    const blobId = searchParams.get("blobId");

    if (!trackId || !blobId) {
      return NextResponse.json(
        { error: "trackId and blobId are required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `http://${config.backend_endpoint}:11112/stream?trackId=${trackId}&blobId=${blobId}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Get the binary data
    const arrayBuffer = await response.arrayBuffer();

    // Create a new response with the binary data and appropriate headers
    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg", // or whatever content type your audio is
        "Content-Length": arrayBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("Error during stream:", error);
    return NextResponse.json(
      { error: "Failed to stream track" },
      { status: 500 }
    );
  }
}
