import { NextResponse } from "next/server";

const backendUrl = (
  process.env.DJANGO_API_URL ||
  (process.env.NODE_ENV === "development" ? "http://127.0.0.1:8000" : "https://vibe-tap.onrender.com")
).replace(/\/$/, "");

export async function POST(request: Request) {
  try {
    const response = await fetch(`${backendUrl}/api/v1/agent/register/`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: await request.text(),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    return new NextResponse(await response.text(), {
      status: response.status,
      headers: { "Content-Type": response.headers.get("Content-Type") || "application/json" },
    });
  } catch {
    return NextResponse.json(
      { detail: "The registration service is unavailable." },
      { status: 503 },
    );
  }
}