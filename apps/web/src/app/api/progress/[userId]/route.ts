import { NextResponse } from "next/server";

import { getApiBaseUrl } from "@/lib/env";

type ProgressRouteProps = {
  params: {
    userId: string;
  };
};

export async function GET(_request: Request, { params }: ProgressRouteProps) {
  const response = await fetch(`${getApiBaseUrl()}/progress/${params.userId}`, {
    cache: "no-store"
  });
  const payload = await response.json().catch(() => null);

  return NextResponse.json(payload, {
    status: response.status
  });
}
