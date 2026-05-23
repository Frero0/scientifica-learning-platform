import Link from "next/link";

import { Button } from "@scientifica/ui";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60svh] max-w-3xl flex-col items-start justify-center px-5 py-20 sm:px-6">
      <p className="text-sm font-semibold uppercase text-teal-700">Not found</p>
      <h1 className="mt-3 text-4xl font-semibold text-ink">This path is not part of the learning map.</h1>
      <p className="mt-4 text-lg leading-8 text-ink/65">Return to the course catalog and continue from an available lesson.</p>
      <Button asChild className="mt-8">
        <Link href="/courses">View courses</Link>
      </Button>
    </section>
  );
}
