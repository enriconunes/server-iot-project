import { NextRequest } from "next/server";
import pool from "@/lib/db";
import { validateApiKey, unauthorizedResponse } from "@/lib/auth";

// GET /api/readings?limit=50
// Header: x-api-key: <API_KEY>
export async function GET(request: NextRequest) {
  if (!validateApiKey(request)) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 50), 500);

  const { rows } = await pool.query(
    `SELECT id, distance, angle, unit, created_at AS "createdAt"
     FROM sensor_readings
     ORDER BY created_at DESC
     LIMIT $1`,
    [limit]
  );

  return Response.json(rows);
}
