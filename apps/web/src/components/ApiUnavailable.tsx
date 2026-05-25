import Link from "next/link";

import { Button } from "@scientifica/ui";

import { getApiBaseUrl } from "@/lib/env";

type ApiUnavailableProps = {
  title?: string;
};

export function ApiUnavailable({ title = "Learning data is unavailable" }: ApiUnavailableProps) {
  return (
    <section className="mx-auto flex min-h-[60svh] max-w-3xl flex-col items-start justify-center px-5 py-20 sm:px-6">
      <p className="text-sm font-semibold uppercase text-teal-700">API connection</p>
      <h1 className="mt-3 text-4xl font-semibold text-ink">{title}</h1>
      <p className="mt-4 text-lg leading-8 text-ink/65">
        The frontend could not reach the Nest API at {getApiBaseUrl()}. Start the full local stack
        with <span className="font-semibold text-ink">pnpm dev</span>, or start the API on port 4000
        before opening course and lesson pages.
      </p>
      <Button asChild className="mt-8" variant="secondary">
        <Link href="/">Back to homepage</Link>
      </Button>
    </section>
  );
}
