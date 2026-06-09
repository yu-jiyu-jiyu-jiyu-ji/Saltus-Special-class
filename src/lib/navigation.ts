import type { Role } from "@/types/auth";

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "システム管理者",
  MANAGER: "マネージャー",
  MEMBER: "メンバー",
};

export type NavItem = {
  href: string;
  label: string;
  icon: string;
  roles?: Role[];
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "ダッシュボード", icon: "⌂" },
  { href: "/dashboard/mtg", label: "MTG議事録", icon: "📝" },
  { href: "/dashboard/support", label: "問い合わせ一覧", icon: "💬" },
  { href: "/dashboard/guide", label: "使い方", icon: "📖" },
  { href: "/dashboard/settings", label: "設定", icon: "🔧" },
  {
    href: "/dashboard/admin",
    label: "管理設定",
    icon: "⚙",
    roles: ["ADMIN"],
  },
];
