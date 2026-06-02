import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey, unauthorizedResponse } from "@/lib/auth";

// There is a single physical actuator: an LED. We persist its state as a
// singleton row (id = 1). The ESP32 sets enabled=true (PATCH) when it detects an
// object at <=30cm, and reads this state (GET) to drive the LED. It is only ever
// turned back off from the dashboard toggle — the server just stores the state.
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
