// route.ts
import { config } from "@/config";
import { NextResponse } from "next/server";

interface UploadPayload {
  audio: string; // base64 encoded audio
  title: string;
  artist_address: string;
  metadata: {
    filename: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
  };
}

export async function POST(request: Request) {
  try {
    // Get the MP3 file from the request
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;
    const title = formData.get("title") as string;
    const artist_address = formData.get("artist_address") as string;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    // Convert File to base64
    const buffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(buffer).toString("base64");

    // Create payload with audio and metadata
    const payload: UploadPayload = {
      audio: base64Audio,
      title,
      artist_address,
      metadata: {
        filename: audioFile.name,
        fileSize: audioFile.size,
        mimeType: audioFile.type,
        uploadedAt: new Date().toISOString(),
      },
    };

    // Send to your Express backend
    console.log("UPLOAD PAYLOAD:   ", payload);
    const response = await fetch(
      `http://${config.backend_endpoint}:11112/upload`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error processing audio:", error);
    return NextResponse.json(
      { error: "Failed to process audio file" },
      { status: 500 }
    );
  }
}
