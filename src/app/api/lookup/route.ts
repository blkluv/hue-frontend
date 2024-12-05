// route.ts
import { config } from "@/config";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      `http://${config.backend_endpoint}:11112/lookup`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error during lookup:", error);
    return NextResponse.json(
      { error: "Failed to query tracks" },
      { status: 500 }
    );
  }
}
