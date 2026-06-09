export type AdminDocId = "current-spec" | "extensibility";

export const ADMIN_DOC_NAV: { id: AdminDocId; href: string; label: string }[] = [
  { id: "current-spec", href: "/dashboard/admin/spec", label: "現行仕様・設計" },
  {
    id: "extensibility",
    href: "/dashboard/admin/spec/extensibility",
    label: "拡張性・ロードマップ",
  },
];
