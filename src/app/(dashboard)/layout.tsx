import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { getSessionUser } from "@/lib/session";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
