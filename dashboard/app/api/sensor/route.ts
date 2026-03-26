import { NextRequest } from "next/server";
import { v7 as uuidv7 } from "uuid";
import pool from "@/lib/db";
import { validateApiKey, unauthorizedResponse } from "@/lib/auth";

// POST /api/sensor
// Body: { distance: number, unit?: string }
// Header: x-api-key: <API_KEY>
export async function POST(request: NextRequest) {
  if (!validateApiKey(request)) return unauthorizedResponse();

  const body = await request.json();
  const { distance, angle, unit } = body;

  if (distance === undefined || typeof distance !== "number") {
    return Response.json(
      { error: "Invalid body. 'distance' (number) is required." },
      { status: 400 }
    );
  }

  const id = uuidv7();
  const { rows } = await pool.query(
    `INSERT INTO sensor_readings (id, distance, angle, unit) VALUES ($1, $2, $3, $4)
     RETURNING id, distance, angle, unit, created_at AS "createdAt"`,
    [id, distance, angle ?? 0, unit ?? "cm"]
  );

  const reading = rows[0];
  const ts = new Date(reading.createdAt).toLocaleString("pt-PT", { timeZone: "Europe/Lisbon" });
  const smsMessage = `Radar IoT — Deteção em ${ts} | Distância: ${reading.distance.toFixed(1)}cm | Ângulo: ${reading.angle.toFixed(1)}°`;
  await pool.query(
    `INSERT INTO sms_log (id, reading_id, message, status) VALUES ($1, $2, $3, 'pending')`,
    [uuidv7(), reading.id, smsMessage]
  );

  return Response.json(reading, { status: 201 });
}
