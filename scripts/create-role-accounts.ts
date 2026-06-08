import "dotenv/config";
import { hash } from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient } from "../src/generated/prisma/client";

const connectionString =
  process.env.DIRECT_URL?.trim() || process.env.DATABASE_URL?.trim();

if (!connectionString) {
  throw new Error("DIRECT_URL または DATABASE_URL が未設定です。");
}

const pool = new Pool({ connectionString });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const ACCOUNTS = [
  {
    name: "システム管理者",
    email: "admin@saltus.local",
    password: "SaltusAdmin2026!",
    role: "ADMIN" as const,
  },
  {
    name: "マネージャー",
    email: "manager@saltus.local",
    password: "SaltusManager2026!",
    role: "MANAGER" as const,
  },
  {
    name: "鈴木 一郎",
    email: "member1@saltus.local",
    password: "SaltusMember2026!",
    role: "MEMBER" as const,
  },
  {
    name: "田中 花子",
    email: "member2@saltus.local",
    password: "SaltusMember2026!",
    role: "MEMBER" as const,
  },
  {
    name: "佐藤 健太",
    email: "member3@saltus.local",
    password: "SaltusMember2026!",
    role: "MEMBER" as const,
  },
];

async function main() {
  for (const account of ACCOUNTS) {
    const existing = await prisma.user.findUnique({
      where: { email: account.email },
    });

    if (existing) {
      const updated = await prisma.user.update({
        where: { email: account.email },
        data: {
          name: account.name,
          role: account.role,
          passwordHash: await hash(account.password, 12),
        },
      });
      console.log(`更新: ${updated.email} (${updated.role})`);
      continue;
    }

    const created = await prisma.user.create({
      data: {
        name: account.name,
        email: account.email,
        passwordHash: await hash(account.password, 12),
        role: account.role,
      },
    });
    console.log(`作成: ${created.email} (${created.role})`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
