import { redirect } from "next/navigation";

import { UserRoleTable } from "@/components/admin/UserRoleTable";
import { PageHeader } from "@/components/layout/PageHeader";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export default async function AdminPage() {
  const user = await getSessionUser();

  if (user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  const serialized = users.map((entry) => ({
    ...entry,
    createdAt: entry.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="管理設定"
        description="登録ユーザーの一覧と権限を管理します。"
      />
      <UserRoleTable users={serialized} currentUserId={user.id} />
    </div>
  );
}
