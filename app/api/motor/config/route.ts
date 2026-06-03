import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey, unauthorizedResponse } from "@/lib/auth";

// Single rotation motor (servo). We persist its on/off state as a singleton row
// (id = 1). The ESP32 reads this (GET) and only sweeps the servo / advances the
// scan angle while enabled — when disabled it freezes in place and resumes from
// the same angle. It is only ever toggled from the dashboard.
const MOTOR_ID = 1;

async function ensureRow() {
  await prisma.motorConfig.upsert({
    where: { id: MOTOR_ID },
    create: { id: MOTOR_ID, enabled: true },
    update: {},
  });
}

// GET /api/motor/config
// Header: x-api-key: <API_KEY>
// Returns: { id, enabled, updatedAt }
export async function GET(request: NextRequest) {
  if (!validateApiKey(request)) return unauthorizedResponse();

  await ensureRow();
  const row = await prisma.motorConfig.findUnique({
    where: { id: MOTOR_ID },
  });

  return Response.json(row, {
    headers: { "Cache-Control": "no-store" },
  });
}

// PATCH /api/motor/config
// Header: x-api-key: <API_KEY>
// Body: { enabled: boolean }
export async function PATCH(request: NextRequest) {
  if (!validateApiKey(request)) return unauthorizedResponse();

  const body = await request.json();
  const { enabled } = body;

  if (typeof enabled !== "boolean") {
    return Response.json(
      { error: "'enabled' (boolean) is required." },
      { status: 400 }
    );
  }

  const updated = await prisma.motorConfig.upsert({
    where: { id: MOTOR_ID },
    create: { id: MOTOR_ID, enabled },
    update: { enabled },
  });

  return Response.json(updated);
}
