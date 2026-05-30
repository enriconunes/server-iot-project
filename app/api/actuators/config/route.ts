import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey, unauthorizedResponse } from "@/lib/auth";

// There is a single physical actuator (LED + buzzer) that share one on/off flag.
// We persist it as a singleton row (id = 1). The decision of *when* to fire it
// (e.g. object detected at <=5cm) lives on the device, not on the server — this
// endpoint only exposes whether the actuator is allowed to act at all.
const ACTUATOR_ID = 1;

async function ensureRow() {
  await prisma.actuatorConfig.upsert({
    where: { id: ACTUATOR_ID },
    create: { id: ACTUATOR_ID, enabled: false },
    update: {},
  });
}

// GET /api/actuators/config
// Header: x-api-key: <API_KEY>
// Returns: { id, enabled, updatedAt }
export async function GET(request: NextRequest) {
  if (!validateApiKey(request)) return unauthorizedResponse();

  await ensureRow();
  const row = await prisma.actuatorConfig.findUnique({
    where: { id: ACTUATOR_ID },
  });

  return Response.json(row, {
    headers: { "Cache-Control": "no-store" },
  });
}

// PATCH /api/actuators/config
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

  const updated = await prisma.actuatorConfig.upsert({
    where: { id: ACTUATOR_ID },
    create: { id: ACTUATOR_ID, enabled },
    update: { enabled },
  });

  return Response.json(updated);
}
