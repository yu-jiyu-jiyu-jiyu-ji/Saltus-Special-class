import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
  poolConnectionString: string | undefined;
};

function resolveConnectionString(): string {
  const direct = process.env.DIRECT_URL?.trim();
  const pooled = process.env.DATABASE_URL?.trim();

  if (direct) {
    return direct;
  }

  if (pooled && !/localhost|127\.0\.0\.1/.test(pooled)) {
    return pooled;
  }

  if (pooled) {
    return pooled;
  }

  throw new Error("DATABASE_URL または DIRECT_URL が未設定です。");
}

function createPrismaClient(): PrismaClient {
  const connectionString = resolveConnectionString();

  if (
    globalForPrisma.pool &&
    globalForPrisma.poolConnectionString !== connectionString
  ) {
    void globalForPrisma.pool.end();
    globalForPrisma.pool = undefined;
    globalForPrisma.prisma = undefined;
  }

  const pool = globalForPrisma.pool ?? new Pool({ connectionString });
  globalForPrisma.pool = pool;
  globalForPrisma.poolConnectionString = connectionString;

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

// ビルド時（DB未設定）に import だけで落ちないよう、初回クエリまで接続を遅延する
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    const value = client[prop as keyof PrismaClient];
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(client);
    }
    return value;
  },
});
