import { NextRequest } from "next/server";
import pool from "@/lib/db";
import { validateApiKey, unauthorizedResponse } from "@/lib/auth";

const ANGLE_STEP = 10;  // degrees per bucket → 36 buckets
const DIST_STEP = 50;   // cm per ring
const MAX_DIST = 400;   // cm

// GET /api/heatmap
// Returns aggregated polar grid for heatmap rendering.
// Response: { angleStep, distStep, maxDist, maxCount, cells[] }
export async function GET(request: NextRequest) {
  if (!validateApiKey(request)) return unauthorizedResponse();

  const { rows } = await pool.query(
    `SELECT
       (FLOOR((angle % 360) / $1) * $1)::int           AS "angleBucket",
       LEAST(FLOOR(distance / $2) * $2, $3 - $2)::int  AS "distBucket",
       COUNT(*)::int                                     AS count
     FROM sensor_readings
     GROUP BY "angleBucket", "distBucket"
     ORDER BY "angleBucket", "distBucket"`,
    [ANGLE_STEP, DIST_STEP, MAX_DIST]
  );

  const maxCount = rows.reduce((m: number, r: { count: number }) => Math.max(m, r.count), 0);

  return Response.json({ angleStep: ANGLE_STEP, distStep: DIST_STEP, maxDist: MAX_DIST, maxCount, cells: rows });
}
