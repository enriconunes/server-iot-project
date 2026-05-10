import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey, unauthorizedResponse } from "@/lib/auth";

// GET /api/bell
// Returns current bell state: { active: boolean, updatedAt: string }
export async function GET(request: NextRequest) {
  if (!validateApiKey(request)) return unauthorizedResponse();

  const state = await prisma.bellState.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, active: false },
  });

  return Response.json({ active: state.active, updatedAt: state.updatedAt });
}

// POST /api/bell
// Toggles bell state. Returns new state: { active: boolean, updatedAt: string }
export async function POST(request: NextRequest) {
  if (!validateApiKey(request)) return unauthorizedResponse();

  const current = await prisma.bellState.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, active: false },
  });

  const updated = await prisma.bellState.update({
    where: { id: 1 },
    data: { active: !current.active },
  });

  return Response.json({ active: updated.active, updatedAt: updated.updatedAt });
}
