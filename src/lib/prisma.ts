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

  // DIRECT_URL を優先（Supabase + pg adapter で安定）。
  // マシン全体の DATABASE_URL=localhost が .env を上書きしている環境でも動作する。
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
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pool = pool;
    globalForPrisma.poolConnectionString = connectionString;
  }

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
