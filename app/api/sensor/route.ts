import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey, unauthorizedResponse } from "@/lib/auth";

// POST /api/sensor
// Body: { distance: number, unit?: string }
// Header: x-api-key: <API_KEY>
export async function POST(request: NextRequest) {
  if (!validateApiKey(request)) return unauthorizedResponse();

  const body = await request.json();
  const { distance, unit } = body;

  if (distance === undefined || typeof distance !== "number") {
    return Response.json(
      { error: "Invalid body. 'distance' (number) is required." },
      { status: 400 }
    );
  }

  const reading = await prisma.sensorReading.create({
    data: { distance, unit: unit ?? "cm" },
  });

  return Response.json(reading, { status: 201 });
}
