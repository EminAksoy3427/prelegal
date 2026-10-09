import fs from "node:fs";
import path from "node:path";

export interface NdaTemplates {
  coverPageRaw: string;
  standardTermsRaw: string;
}

/**
 * Reads the Mutual NDA templates straight from the repo's shared `templates/`
 * directory (one level above `frontend/`) so the app always reflects the
 * canonical legal text rather than a copy that can drift out of sync.
 */
export function readNdaTemplates(): NdaTemplates {
  const templatesDir = path.join(process.cwd(), "..", "templates");
  const coverPageRaw = fs.readFileSync(
    path.join(templatesDir, "Mutual-NDA-coverpage.md"),
    "utf8"
  );
  const standardTermsRaw = fs.readFileSync(
    path.join(templatesDir, "Mutual-NDA.md"),
    "utf8"
  );
  return { coverPageRaw, standardTermsRaw };
}
