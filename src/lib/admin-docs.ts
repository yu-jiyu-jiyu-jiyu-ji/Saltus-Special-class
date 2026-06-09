import { readFile } from "fs/promises";
import path from "path";

import type { AdminDocId } from "@/lib/admin-doc-nav";

export type { AdminDocId } from "@/lib/admin-doc-nav";

export type AdminDocSection = {
  id: string;
  title: string;
};

const DOC_FILES: Record<AdminDocId, string> = {
  "current-spec": "current-spec.md",
  extensibility: "extensibility.md",
};

export async function loadAdminDoc(docId: AdminDocId): Promise<string> {
  const filePath = path.join(
    process.cwd(),
    "src/content/admin",
    DOC_FILES[docId],
  );
  return readFile(filePath, "utf-8");
}

export function extractAdminDocSections(markdown: string): AdminDocSection[] {
  const sections: AdminDocSection[] = [];
  const regex = /^## (.+)$/gm;
  let match = regex.exec(markdown);
  let index = 0;

  while (match) {
    index += 1;
    sections.push({
      id: `section-${index}`,
      title: match[1].trim(),
    });
    match = regex.exec(markdown);
  }

  return sections;
}
