import { NextRequest } from "next/server";
import pool from "@/lib/db";
import { validateApiKey, unauthorizedResponse } from "@/lib/auth";

// GET /api/bell
// Returns current bell state: { active: boolean, updatedAt: string }
export async function GET(request: NextRequest) {
  if (!validateApiKey(request)) return unauthorizedResponse();

  const { rows } = await pool.query(
    `SELECT active, updated_at AS "updatedAt" FROM bell_state WHERE id = 1`
  );

  if (rows.length === 0) {
    return Response.json({ active: false, updatedAt: new Date().toISOString() });
  }

  return Response.json(rows[0]);
}

// POST /api/bell
// Toggles bell state. Returns new state: { active: boolean, updatedAt: string }
export async function POST(request: NextRequest) {
  if (!validateApiKey(request)) return unauthorizedResponse();

  const { rows } = await pool.query(
    `UPDATE bell_state
     SET active = NOT active, updated_at = NOW()
     WHERE id = 1
     RETURNING active, updated_at AS "updatedAt"`
  );

  return Response.json(rows[0]);
}
