import { NextRequest } from "next/server";
import pool from "@/lib/db";
import { validateApiKey, unauthorizedResponse } from "@/lib/auth";

const ANGLE_STEP = 10;
const DIST_STEP = 50;
const MAX_DIST = 400;
const ANGLE_BUCKETS = 360 / ANGLE_STEP; // 36
const DIST_BUCKETS = MAX_DIST / DIST_STEP; // 8
const TOP_K = 5;

// GET /api/predict
// Returns the top-K most probable next detection locations using a 2D KDE.
// Response: { predictions: { angle, distance, probability }[] }
export async function GET(request: NextRequest) {
  if (!validateApiKey(request)) return unauthorizedResponse();

  const { rows } = await pool.query(
    `SELECT
       (FLOOR((angle % 360) / $1) * $1)::int           AS "angleBucket",
       LEAST(FLOOR(distance / $2) * $2, $3 - $2)::int  AS "distBucket",
       COUNT(*)::int                                     AS count
     FROM sensor_readings
     GROUP BY "angleBucket", "distBucket"`,
    [ANGLE_STEP, DIST_STEP, MAX_DIST]
  );

  if (rows.length === 0) {
    return Response.json({ predictions: [] });
  }

  // Build 2D histogram grid [angleBucket][distBucket]
  const grid: number[][] = Array.from({ length: ANGLE_BUCKETS }, () =>
    new Array(DIST_BUCKETS).fill(0)
  );
  for (const row of rows) {
    const ai = Math.round(Number(row.angleBucket) / ANGLE_STEP) % ANGLE_BUCKETS;
    const di = Math.min(Math.round(Number(row.distBucket) / DIST_STEP), DIST_BUCKETS - 1);
    grid[ai][di] = Number(row.count);
  }

  // Gaussian kernel density estimation (5×5 kernel, σ≈1.4)
  const smoothed: number[][] = Array.from({ length: ANGLE_BUCKETS }, () =>
    new Array(DIST_BUCKETS).fill(0)
  );
  for (let ai = 0; ai < ANGLE_BUCKETS; ai++) {
    for (let di = 0; di < DIST_BUCKETS; di++) {
      let val = 0;
      for (let da = -2; da <= 2; da++) {
        for (let dd = -2; dd <= 2; dd++) {
          const nai = (ai + da + ANGLE_BUCKETS) % ANGLE_BUCKETS;
          const ndi = Math.max(0, Math.min(DIST_BUCKETS - 1, di + dd));
          const weight = Math.exp(-(da * da + dd * dd) / 2);
          val += grid[nai][ndi] * weight;
        }
      }
      smoothed[ai][di] = val;
    }
  }

  // Flatten, compute total, sort
  let total = 0;
  const cells: { ai: number; di: number; val: number }[] = [];
  for (let ai = 0; ai < ANGLE_BUCKETS; ai++) {
    for (let di = 0; di < DIST_BUCKETS; di++) {
      if (smoothed[ai][di] > 0) {
        total += smoothed[ai][di];
        cells.push({ ai, di, val: smoothed[ai][di] });
      }
    }
  }
  cells.sort((a, b) => b.val - a.val);

  const predictions = cells.slice(0, TOP_K).map((c) => ({
    angle: c.ai * ANGLE_STEP + ANGLE_STEP / 2,
    distance: c.di * DIST_STEP + DIST_STEP / 2,
    probability: total > 0 ? c.val / total : 0,
  }));

  return Response.json({ predictions });
}
