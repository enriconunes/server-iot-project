import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey, unauthorizedResponse } from "@/lib/auth";

// GET /api/sms/log?limit=N -> recent SMS history (most recent first)
export async function GET(request: NextRequest) {
  if (!validateApiKey(request)) return unauthorizedResponse();

  const limitParam = Number(request.nextUrl.searchParams.get("limit") ?? 50);
  const take = Number.isFinite(limitParam)
    ? Math.min(Math.max(Math.trunc(limitParam), 1), 200)
    : 50;

  const rows = await prisma.smsLog.findMany({
    orderBy: { createdAt: "desc" },
    take,
  });

  return Response.json(rows, { headers: { "Cache-Control": "no-store" } });
}
