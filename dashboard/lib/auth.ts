import { NextRequest } from "next/server";
import { env } from "@/lib/env";

export function validateApiKey(request: NextRequest): boolean {
  const apiKey =
    request.headers.get("x-api-key") ||
    new URL(request.url).searchParams.get("key");
  return apiKey === env.API_KEY;
}

export function unauthorizedResponse() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
