import { readFile } from "fs/promises";
import path from "path";

export type GuideSection = {
  id: string;
  title: string;
};

export async function loadMemberGuideMarkdown(): Promise<string> {
  const filePath = path.join(process.cwd(), "src/content/help/member-guide.md");
  return readFile(filePath, "utf-8");
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
