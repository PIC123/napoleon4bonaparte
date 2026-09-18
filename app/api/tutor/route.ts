import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt, formatContext, type LabContext } from "@/lib/tutor-prompt";

export const runtime = "nodejs";

const MODEL = process.env.TUTOR_MODEL ?? "claude-opus-5";
const EFFORT = (process.env.TUTOR_EFFORT ?? "medium") as "low" | "medium" | "high";
const SYSTEM = buildSystemPrompt();

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface TutorRequest {
  messages: ChatMessage[];
  context: LabContext;
}

/**
 * Streams the tutor's reply as plain text. The client appends chunks as they
 * arrive. If no API credentials are configured the route answers 503 with
 * `{ offline: true }` and the client falls back to scripted hints, so the lab
 * is fully usable without a key.
 */
export async function POST(req: Request) {
  const hasCreds = Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
  if (!hasCreds) {
    return Response.json({ offline: true, reason: "ANTHROPIC_API_KEY is not set" }, { status: 503 });
  }

  let body: TutorRequest;
  try {
    body = (await req.json()) as TutorRequest;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0 || !body.context) {
    return Response.json({ error: "messages and context are required" }, { status: 400 });
  }

  // Keep the conversation bounded; the tutor doesn't need ancient history.
  const history = body.messages.slice(-24).filter((m) => typeof m.content === "string" && m.content.trim());
  const messages: Anthropic.Beta.BetaMessageParam[] = history.map((m, i) => {
    const isLast = i === history.length - 1;
    if (isLast && m.role === "user") {
      // Volatile lab state rides with the final user turn so the cached
      // system prefix stays byte-identical across requests.
      return {
        role: "user",
        content: `${m.content}\n\n[Lab state for the tutor, not written by the student]\n${formatContext(body.context)}`,
      };
    }
    return { role: m.role, content: m.content };
  });
  if (messages[0]?.role !== "user") {
    messages.unshift({ role: "user", content: "(The student opened the chat.)" });
  }

  const client = new Anthropic();
  const encoder = new TextEncoder();

  const stream = client.beta.messages.stream({
    model: MODEL,
    max_tokens: 4096,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: EFFORT },
    system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
    messages,
  });

  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(
            encoder.encode("I can't help with that one, but I'm very happy to talk pastry. What are you working on at the bench?"),
          );
        }
      } catch (err) {
        controller.enqueue(encoder.encode(`\n\n(${describeError(err)})`));
      } finally {
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Tutor-Model": MODEL,
    },
  });
}

function describeError(err: unknown): string {
  if (err instanceof Anthropic.AuthenticationError) return "The tutor's API key was rejected.";
  if (err instanceof Anthropic.RateLimitError) return "The tutor is rate limited right now. Try again in a moment.";
  if (err instanceof Anthropic.APIConnectionError) return "The tutor couldn't reach the API.";
  if (err instanceof Anthropic.APIError) return `The tutor hit an API error (${err.status}).`;
  return "The tutor ran into an unexpected problem.";
}
