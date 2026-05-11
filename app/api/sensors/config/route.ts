import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey, unauthorizedResponse } from "@/lib/auth";

const ALL_SENSORS = [1, 2, 3, 4];

async function ensureRows() {
  // Make sure all 4 sensors exist; default newly-created ones to disabled (operator must enable explicitly)
  await prisma.sensorConfig.createMany({
    data: ALL_SENSORS.map((sensor) => ({ sensor, enabled: sensor <= 2 })),
    skipDuplicates: true,
  });
}

// GET /api/sensors/config
// Header: x-api-key: <API_KEY>
// Returns: [{ sensor, enabled, updatedAt }, ...] for sensors 1..4
export async function GET(request: NextRequest) {
  if (!validateApiKey(request)) return unauthorizedResponse();

  await ensureRows();
  const rows = await prisma.sensorConfig.findMany({
    orderBy: { sensor: "asc" },
  });

  return Response.json(rows, {
    headers: { "Cache-Control": "no-store" },
  });
}

// PATCH /api/sensors/config
// Header: x-api-key: <API_KEY>
// Body: { sensor: 1..4, enabled: boolean }
export async function PATCH(request: NextRequest) {
  if (!validateApiKey(request)) return unauthorizedResponse();

  const body = await request.json();
  const { sensor, enabled } = body;

  if (
    typeof sensor !== "number" ||
    !Number.isInteger(sensor) ||
    sensor < 1 ||
    sensor > 4
  ) {
    return Response.json(
      { error: "'sensor' must be an integer between 1 and 4." },
      { status: 400 }
    );
  }
  if (typeof enabled !== "boolean") {
    return Response.json(
      { error: "'enabled' (boolean) is required." },
      { status: 400 }
    );
  }

  const updated = await prisma.sensorConfig.upsert({
    where: { sensor },
    create: { sensor, enabled },
    update: { enabled },
  });

  return Response.json(updated);
}
