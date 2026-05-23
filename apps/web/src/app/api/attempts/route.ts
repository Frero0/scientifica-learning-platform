import { NextResponse } from "next/server";

import { getApiBaseUrl } from "@/lib/env";

export async function POST(request: Request) {
  const body = await request.json();
  const response = await fetch(`${getApiBaseUrl()}/attempts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body),
    cache: "no-store"
  });
  const payload = await response.json().catch(() => null);

  return NextResponse.json(payload, {
    status: response.status
  });
}
