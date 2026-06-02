import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey, unauthorizedResponse } from "@/lib/auth";
import { sendProximityAlert } from "@/lib/sms";

// Distance (in cm) at or below which we consider an object "very close" and
// fire the SMS proximity alert. This threshold only governs the SMS; the LED
// actuator has its own (<=30cm) trigger handled on the ESP32.
const PROXIMITY_THRESHOLD_CM = 5;

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

  // (O ESP32 já ignora localmente os sensores desligados — lê /api/sensors/config.
  // Não fazemos aqui uma query extra por POST para não sobrecarregar a base de dados.)

  const unitNormalized = (unit ?? "cm").toLowerCase();

  const reading = await prisma.sensorReading.create({
    data: { sensor, distance, angle, unit: unitNormalized },
  });

  // Proximity alert: if the object is very close (<=5cm), notify by SMS.
  // Awaited but fully self-contained — sendProximityAlert never throws and is
  // throttled per sensor, so it can neither break nor delay normal readings.
  if (unitNormalized === "cm" && distance <= PROXIMITY_THRESHOLD_CM) {
    await sendProximityAlert({ sensor, distance, unit: unitNormalized });
  }

  return Response.json(reading, { status: 201 });
}
