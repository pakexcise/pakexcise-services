import { getCurrentUser } from "@/server/auth/current-user";
import { subscribeRealtimeUser, type RealtimeServerEvent } from "@/server/realtime/publisher";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const HEARTBEAT_INTERVAL_MS = 30_000;

function encodeSseMessage(event: RealtimeServerEvent): string {
  return `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
}

export async function GET(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (user.role !== "CUSTOMER" && user.role !== "AGENT") {
    return new Response("Forbidden", { status: 403 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let closed = false;

      const send = (event: RealtimeServerEvent) => {
        if (closed) {
          return;
        }

        try {
          controller.enqueue(encoder.encode(encodeSseMessage(event)));
        } catch {
          closed = true;
        }
      };

      const heartbeat = setInterval(() => {
        send({
          type: "heartbeat",
          timestamp: new Date().toISOString(),
        });
      }, HEARTBEAT_INTERVAL_MS);

      const unsubscribe = subscribeRealtimeUser({
        userId: user.id,
        send,
      });

      send({
        type: "heartbeat",
        timestamp: new Date().toISOString(),
      });

      const close = () => {
        if (closed) {
          return;
        }

        closed = true;
        clearInterval(heartbeat);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // Stream already closed.
        }
      };

      if (request.signal.aborted) {
        close();
        return;
      }

      request.signal.addEventListener("abort", close, { once: true });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
