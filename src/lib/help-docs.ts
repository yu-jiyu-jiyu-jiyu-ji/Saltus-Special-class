import { readFile } from "fs/promises";
import path from "path";

import type { Role } from "@/types/auth";

export type GuideSection = {
  id: string;
  title: string;
};

const ADMIN_ONLY_SECTION_TITLE = "画像の差し替え方法（管理者向けメモ）";

export async function loadMemberGuideMarkdown(): Promise<string> {
  const filePath = path.join(process.cwd(), "src/content/help/member-guide.md");
  return readFile(filePath, "utf-8");
}

export function filterGuideContentForRole(markdown: string, role: Role): string {
  if (role === "ADMIN") {
    return markdown;
  }

  const lines = markdown.split("\n");
  const filtered: string[] = [];
  let skipAdminSection = false;

  for (const line of lines) {
    const headingMatch = line.match(/^## (.+)$/);
    if (headingMatch) {
      skipAdminSection = headingMatch[1].trim() === ADMIN_ONLY_SECTION_TITLE;
    }

    if (!skipAdminSection) {
      filtered.push(line);
    }
  }

  return filtered.join("\n").trimEnd();
}

export function extractGuideSections(markdown: string): GuideSection[] {
  const sections: GuideSection[] = [];
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
