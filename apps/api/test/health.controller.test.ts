import "reflect-metadata";

import { Test } from "@nestjs/testing";
import { describe, expect, it } from "vitest";

import { HealthModule } from "../src/health/health.module";

describe("Health endpoint", () => {
  it("starts a minimal Nest app and returns health status", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [HealthModule]
    }).compile();
    const app = moduleRef.createNestApplication();

    await app.init();
    await app.listen(0);

    try {
      const response = await fetch(`${await app.getUrl()}/health`);
      const payload = (await response.json()) as {
        status?: string;
        service?: string;
        timestamp?: string;
      };

      expect(response.status).toBe(200);
      expect(payload.status).toBe("ok");
      expect(payload.service).toBe("scientifica-api");
      expect(typeof payload.timestamp).toBe("string");
    } finally {
      await app.close();
    }
  });
});
