import { NextRequest, NextResponse } from "next/server";
import {
  createChatCompletion,
  createChatStream,
  isOpenRouterConfigured,
  DEFAULT_OPENROUTER_MODEL,
  ChatMessage,
} from "@/lib/openrouter";

export async function POST(req: NextRequest) {
  try {
    if (!isOpenRouterConfigured()) {
      return NextResponse.json(
        {
          error:
            "Klucz OPENROUTER_API_KEY nie został skonfigurowany. Dodaj swój klucz do pliku web/.env.local (np. OPENROUTER_API_KEY=sk-or-v1-...).",
        },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      messages,
      model = DEFAULT_OPENROUTER_MODEL,
      stream = true,
      temperature = 0.7,
      maxTokens,
      systemPrompt,
    } = body as {
      messages: ChatMessage[];
      model?: string;
      stream?: boolean;
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Wymagane jest przekazanie tablicy wiadomości (messages)." },
        { status: 400 }
      );
    }

    // Streaming mode
    if (stream) {
      const streamResponse = await createChatStream({
        messages,
        model,
        temperature,
        maxTokens,
        systemPrompt,
      });

      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of streamResponse) {
              const content = chunk.choices[0]?.delta?.content || "";
              if (content) {
                // Send raw text chunk
                controller.enqueue(encoder.encode(content));
              }
            }
            controller.close();
          } catch (err) {
            controller.error(err);
          }
        },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Transfer-Encoding": "chunked",
          "Cache-Control": "no-cache, no-transform",
        },
      });
    }

    // Non-streaming mode
    const completion = await createChatCompletion({
      messages,
      model,
      temperature,
      maxTokens,
      systemPrompt,
    });

    return NextResponse.json({
      success: true,
      data: completion,
    });
  } catch (error: unknown) {
    console.error("OpenRouter API Error:", error);
    const message =
      error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
