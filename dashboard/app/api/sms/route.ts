import { NextRequest } from "next/server";
import pool from "@/lib/db";
import { validateApiKey, unauthorizedResponse } from "@/lib/auth";

// GET /api/sms?limit=50
// Returns SMS log with joined sensor reading data.
export async function GET(request: NextRequest) {
  if (!validateApiKey(request)) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 50), 200);

  const { rows } = await pool.query(
    `SELECT
       s.id,
       s.reading_id  AS "readingId",
       s.phone_to    AS "phoneTo",
       s.message,
       s.status,
       s.sid,
       s.sent_at     AS "sentAt",
       r.distance,
       r.angle,
       r.unit,
       r.created_at  AS "readingAt"
     FROM sms_log s
     JOIN sensor_readings r ON r.id = s.reading_id
     ORDER BY s.sent_at DESC
     LIMIT $1`,
    [limit]
  );

  return Response.json(rows);
}
