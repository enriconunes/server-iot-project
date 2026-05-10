import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey, unauthorizedResponse } from "@/lib/auth";

// POST /api/sensor
// Body: { sensor: 1..4, distance: number, angle: 0..360, unit?: string }
// Header: x-api-key: <API_KEY>
export async function POST(request: NextRequest) {
  if (!validateApiKey(request)) return unauthorizedResponse();

  const body = await request.json();
  const { sensor, distance, angle, unit } = body;

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

  if (typeof distance !== "number" || Number.isNaN(distance)) {
    return Response.json(
      { error: "'distance' (number) is required." },
      { status: 400 }
    );
  }

  if (
    typeof angle !== "number" ||
    Number.isNaN(angle) ||
    angle < 0 ||
    angle > 360
  ) {
    return Response.json(
      { error: "'angle' must be a number between 0 and 360." },
      { status: 400 }
    );
  }

  const reading = await prisma.sensorReading.create({
    data: { sensor, distance, angle, unit: unit ?? "cm" },
  });

  return Response.json(reading, { status: 201 });
}
