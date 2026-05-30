import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey, unauthorizedResponse } from "@/lib/auth";

// Global SMS on/off switch, stored as a singleton row (id = 1).
const SMS_CONFIG_ID = 1;

async function ensureRow() {
  await prisma.smsConfig.upsert({
    where: { id: SMS_CONFIG_ID },
    create: { id: SMS_CONFIG_ID, enabled: true },
    update: {},
  });
}

// GET /api/sms/config -> { id, enabled, updatedAt }
export async function GET(request: NextRequest) {
  if (!validateApiKey(request)) return unauthorizedResponse();

  await ensureRow();
  const row = await prisma.smsConfig.findUnique({
    where: { id: SMS_CONFIG_ID },
  });

  return Response.json(row, { headers: { "Cache-Control": "no-store" } });
}

// PATCH /api/sms/config  Body: { enabled: boolean }
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

  const updated = await prisma.smsConfig.upsert({
    where: { id: SMS_CONFIG_ID },
    create: { id: SMS_CONFIG_ID, enabled },
    update: { enabled },
  });

  return Response.json(updated);
}
