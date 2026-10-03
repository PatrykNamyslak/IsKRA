import { NextResponse } from "next/server";
import { isOpenRouterConfigured, DEFAULT_OPENROUTER_MODEL } from "@/lib/openrouter";

export async function GET() {
  return NextResponse.json({
    configured: isOpenRouterConfigured(),
    defaultModel: DEFAULT_OPENROUTER_MODEL,
  });
}
