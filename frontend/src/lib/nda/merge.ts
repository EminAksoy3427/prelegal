import { NdaFormData } from "./types";

const PURPOSE_PLACEHOLDER =
  "[Evaluating whether to enter into a business relationship with the other party.]";
const EFFECTIVE_DATE_PLACEHOLDER = "[Today’s date]";
const GOVERNING_LAW_PLACEHOLDER = "[Fill in state]";
const JURISDICTION_PLACEHOLDER =
  "[Fill in city or county and state, i.e. “courts located in New Castle, DE”]";

const MNDA_TERM_FIXED_LINE = "- [x]     Expires [1 year(s)] from Effective Date.";
const MNDA_TERM_ONGOING_LINE =
  "- [ ]     Continues until terminated in accordance with the terms of the MNDA.";
const CONFIDENTIALITY_FIXED_LINE =
  "- [x]     [1 year(s)] from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws.";
const CONFIDENTIALITY_PERPETUAL_LINE = "- [ ]     In perpetuity.";

const COVERPAGE_TABLE_START = "|| PARTY 1 | PARTY 2 |";
const COVERPAGE_FOOTER_START =
  "Common Paper Mutual Non-Disclosure Agreement (Version 1.0)";

function normalizeLineEndings(text: string): string {
  return text.replace(/\r\n/g, "\n");
}

/** Replaces the first literal occurrence of `search` without `$`-pattern expansion. */
function safeReplace(text: string, search: string, value: string): string {
  const index = text.indexOf(search);
  if (index === -1) return text;
  return text.slice(0, index) + value + text.slice(index + search.length);
}

function checkbox(checked: boolean): string {
  return checked ? "[x]" : "[ ]";
}

export function formatDisplayDate(iso: string): string {
  if (!iso) return "";
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return "";
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function describeMndaTerm(data: NdaFormData): string {
  return data.mndaTermType === "fixed"
    ? `Expires ${data.mndaTermYears} year(s) from Effective Date.`
    : "Continues until terminated in accordance with the terms of the MNDA.";
}

export function describeConfidentialityTerm(data: NdaFormData): string {
  return data.confidentialityTermType === "fixed"
    ? `${data.confidentialityTermYears} year(s) from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws.`
    : "In perpetuity.";
}

/** Fills the Cover Page template with the form data, keeping its markdown structure. */
export function fillCoverPage(raw: string, data: NdaFormData): string {
  let text = normalizeLineEndings(raw);

  text = safeReplace(text, PURPOSE_PLACEHOLDER, data.purpose || PURPOSE_PLACEHOLDER);
  text = safeReplace(
    text,
    EFFECTIVE_DATE_PLACEHOLDER,
    formatDisplayDate(data.effectiveDate) || EFFECTIVE_DATE_PLACEHOLDER
  );

  text = safeReplace(
    text,
    MNDA_TERM_FIXED_LINE,
    `- ${checkbox(data.mndaTermType === "fixed")}     Expires ${data.mndaTermYears} year(s) from Effective Date.`
  );
  text = safeReplace(
    text,
    MNDA_TERM_ONGOING_LINE,
    `- ${checkbox(data.mndaTermType === "ongoing")}     Continues until terminated in accordance with the terms of the MNDA.`
  );

  text = safeReplace(
    text,
    CONFIDENTIALITY_FIXED_LINE,
    `- ${checkbox(data.confidentialityTermType === "fixed")}     ${data.confidentialityTermYears} year(s) from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws.`
  );
  text = safeReplace(
    text,
    CONFIDENTIALITY_PERPETUAL_LINE,
    `- ${checkbox(data.confidentialityTermType === "perpetual")}     In perpetuity.`
  );

  text = safeReplace(
    text,
    GOVERNING_LAW_PLACEHOLDER,
    data.governingLaw || GOVERNING_LAW_PLACEHOLDER
  );
  text = safeReplace(
    text,
    JURISDICTION_PLACEHOLDER,
    data.jurisdiction || JURISDICTION_PLACEHOLDER
  );

  const tableStart = text.indexOf(COVERPAGE_TABLE_START);
  const footerStart = text.indexOf(COVERPAGE_FOOTER_START);
  if (tableStart !== -1 && footerStart !== -1 && footerStart > tableStart) {
    const filledTable = [
      "|| PARTY 1 | PARTY 2 |",
      "|:--- | :----: | :----: |",
      "| Signature | | |",
      `| Print Name | ${data.partyOne.name} | ${data.partyTwo.name} |`,
      `| Title | ${data.partyOne.title} | ${data.partyTwo.title} |`,
      `| Company | ${data.partyOne.company} | ${data.partyTwo.company} |`,
      `| Notice Address | ${data.partyOne.noticeAddress} | ${data.partyTwo.noticeAddress} |`,
      "| Date | | |",
      "",
      "",
    ].join("\n");
    text = text.slice(0, tableStart) + filledTable + text.slice(footerStart);
  }

  return text;
}

/** Fills the `coverpage_link` placeholders inside the Standard Terms with the form data. */
export function fillStandardTerms(raw: string, data: NdaFormData): string {
  let text = normalizeLineEndings(raw);

  const substitutions: Array<[string, string]> = [
    ["Purpose", data.purpose || "the Purpose"],
    ["Effective Date", formatDisplayDate(data.effectiveDate) || "the Effective Date"],
    ["MNDA Term", describeMndaTerm(data)],
    ["Term of Confidentiality", describeConfidentialityTerm(data)],
    ["Governing Law", data.governingLaw || "the Governing Law"],
    ["Jurisdiction", data.jurisdiction || "the Jurisdiction"],
  ];

  for (const [label, value] of substitutions) {
    const span = `<span class="coverpage_link">${label}</span>`;
    text = text.split(span).join(`**${value}**`);
  }

  return text;
}

/** Merges the filled Cover Page and Standard Terms into one document. */
export function buildMergedDocument(
  coverPageRaw: string,
  standardTermsRaw: string,
  data: NdaFormData
): string {
  const coverPage = fillCoverPage(coverPageRaw, data);
  const standardTerms = fillStandardTerms(standardTermsRaw, data);
  return `${coverPage}\n\n---\n\n${standardTerms}`;
}

export interface StandardTermsClauses {
  clauses: string[];
  footer: string;
}

/** Splits the filled Standard Terms into individual clause paragraphs for PDF rendering. */
export function splitStandardTermsClauses(
  filledStandardTerms: string
): StandardTermsClauses {
  const paragraphs = filledStandardTerms
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const footerIndex = paragraphs.findIndex((p) =>
    p.startsWith("Common Paper Mutual Non-Disclosure Agreement")
  );
  const footer = footerIndex !== -1 ? paragraphs[footerIndex] : "";
  const clauses = paragraphs.filter(
    (p, i) => i !== footerIndex && !p.startsWith("# ")
  );

  return { clauses, footer };
}

/** Strips `[label](url)` markdown links down to their label text. */
export function stripMarkdownLinks(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}
