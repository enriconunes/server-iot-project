import { NextRequest } from "next/server";
import pool from "@/lib/db";
import { validateApiKey, unauthorizedResponse } from "@/lib/auth";

// GET /api/sse
// Server-Sent Events stream for real-time sensor readings
export async function GET(request: NextRequest) {
  if (!validateApiKey(request)) return unauthorizedResponse();

  const encoder = new TextEncoder();
  let lastId = "00000000-0000-0000-0000-000000000000";
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      // Get the latest reading ID as starting point
      const { rows: latestRows } = await pool.query(
        `SELECT id FROM sensor_readings ORDER BY id DESC LIMIT 1`
      );
      if (latestRows.length > 0) lastId = latestRows[0].id;

      const poll = async () => {
        if (closed) return;

        try {
          // Fetch new readings since last known ID
          const { rows: newReadings } = await pool.query(
            `SELECT id, distance, angle, unit, created_at AS "createdAt"
             FROM sensor_readings
             WHERE id > $1
             ORDER BY id ASC`,
            [lastId]
          );

          for (const reading of newReadings) {
            const data = JSON.stringify(reading);
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            lastId = reading.id;
          }

        } catch {
          // DB error — skip this tick
        }

        if (!closed) {
          setTimeout(poll, 500);
        }
      };

      // Send initial keepalive
      controller.enqueue(encoder.encode(`: connected\n\n`));
      poll();
    },
    cancel() {
      closed = true;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
