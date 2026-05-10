import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey, unauthorizedResponse } from "@/lib/auth";

// GET /api/readings?limit=50&sensor=1
// Header: x-api-key: <API_KEY>
export async function GET(request: NextRequest) {
  if (!validateApiKey(request)) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 50), 500);
  const sensorParam = searchParams.get("sensor");
  const sensor = sensorParam ? Number(sensorParam) : undefined;

  const readings = await prisma.sensorReading.findMany({
    where: sensor ? { sensor } : undefined,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return Response.json(readings);
}
