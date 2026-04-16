import { NextResponse } from "next/server";

import { orchestrateTriageDecision } from "@/lib/triage/orchestrator";
import type { GeminiTriageRequest } from "@/types";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as GeminiTriageRequest;
    const decision = await orchestrateTriageDecision(payload);

    return NextResponse.json({ decision });
  } catch {
    return NextResponse.json(
      { error: "Unable to process triage orchestration request." },
      { status: 500 }
    );
  }
}
