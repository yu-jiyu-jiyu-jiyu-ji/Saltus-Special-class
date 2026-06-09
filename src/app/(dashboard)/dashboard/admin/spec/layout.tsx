import { redirect } from "next/navigation";

import { AdminSpecNav } from "@/components/admin/AdminSpecNav";
import { getSessionUser } from "@/lib/session";

export default async function AdminSpecLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();

  if (user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <AdminSpecNav />
      {children}
    </div>
  );
}
