"use client";

import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { buildMergedDocument } from "@/lib/nda/merge";
import { createDefaultNdaFormData, NdaFormData } from "@/lib/nda/types";
import PartyFields from "@/components/PartyFields";

interface NdaBuilderProps {
  coverPageRaw: string;
  standardTermsRaw: string;
}

export default function NdaBuilder({
  coverPageRaw,
  standardTermsRaw,
}: NdaBuilderProps) {
  const [data, setData] = useState<NdaFormData>(createDefaultNdaFormData);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Defaults "today" on the client only, since this value must not be baked
  // into the prerendered static shell. Computing it during render instead
  // would also desync from the build-time static shell on hydration.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData((prev) =>
      prev.effectiveDate
        ? prev
        : { ...prev, effectiveDate: new Date().toISOString().slice(0, 10) }
    );
  }, []);

  const mergedMarkdown = useMemo(
    () => buildMergedDocument(coverPageRaw, standardTermsRaw, data),
    [coverPageRaw, standardTermsRaw, data]
  );

  const update = <K extends keyof NdaFormData>(key: K, value: NdaFormData[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadError(null);
    try {
      const [{ pdf }, { default: NdaPdfDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/NdaPdfDocument"),
      ]);
      const blob = await pdf(
        <NdaPdfDocument data={data} standardTermsRaw={standardTermsRaw} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Mutual-NDA.pdf";
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setDownloadError("Something went wrong generating the PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Mutual NDA Creator
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Fill in the details below to generate a complete Mutual
          Non-Disclosure Agreement, based on the Common Paper standard
          Mutual NDA.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label
              htmlFor="purpose"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Purpose
              <span className="block text-xs font-normal text-gray-500">
                How Confidential Information may be used
              </span>
            </label>
            <textarea
              id="purpose"
              value={data.purpose}
              onChange={(e) => update("purpose", e.target.value)}
              rows={3}
              className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="effectiveDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Effective Date
            </label>
            <input
              id="effectiveDate"
              type="date"
              value={data.effectiveDate}
              onChange={(e) => update("effectiveDate", e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              MNDA Term
              <span className="block text-xs font-normal text-gray-500">
                The length of this MNDA
              </span>
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="mndaTermType"
                  checked={data.mndaTermType === "fixed"}
                  onChange={() => update("mndaTermType", "fixed")}
                />
                Expires
                <input
                  type="number"
                  min={1}
                  aria-label="MNDA term length in years"
                  value={data.mndaTermYears}
                  onChange={(e) =>
                    update("mndaTermYears", Number(e.target.value) || 1)
                  }
                  disabled={data.mndaTermType !== "fixed"}
                  className="w-16 rounded border border-gray-300 px-2 py-1 text-sm disabled:bg-gray-100"
                />
                year(s) from Effective Date
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="mndaTermType"
                  checked={data.mndaTermType === "ongoing"}
                  onChange={() => update("mndaTermType", "ongoing")}
                />
                Continues until terminated
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Term of Confidentiality
              <span className="block text-xs font-normal text-gray-500">
                How long Confidential Information is protected
              </span>
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="confidentialityTermType"
                  checked={data.confidentialityTermType === "fixed"}
                  onChange={() => update("confidentialityTermType", "fixed")}
                />
                <input
                  type="number"
                  min={1}
                  aria-label="Term of confidentiality length in years"
                  value={data.confidentialityTermYears}
                  onChange={(e) =>
                    update(
                      "confidentialityTermYears",
                      Number(e.target.value) || 1
                    )
                  }
                  disabled={data.confidentialityTermType !== "fixed"}
                  className="w-16 rounded border border-gray-300 px-2 py-1 text-sm disabled:bg-gray-100"
                />
                year(s) from Effective Date
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="confidentialityTermType"
                  checked={data.confidentialityTermType === "perpetual"}
                  onChange={() => update("confidentialityTermType", "perpetual")}
                />
                In perpetuity
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="governingLaw"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Governing Law
              </label>
              <input
                id="governingLaw"
                type="text"
                placeholder="e.g. Delaware"
                value={data.governingLaw}
                onChange={(e) => update("governingLaw", e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="jurisdiction"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Jurisdiction
              </label>
              <input
                id="jurisdiction"
                type="text"
                placeholder="e.g. courts located in New Castle, DE"
                value={data.jurisdiction}
                onChange={(e) => update("jurisdiction", e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <PartyFields
              label="Party 1"
              party={data.partyOne}
              onChange={(partyOne) => update("partyOne", partyOne)}
            />
            <PartyFields
              label="Party 2"
              party={data.partyTwo}
              onChange={(partyTwo) => update("partyTwo", partyTwo)}
            />
          </div>

          <div>
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
            >
              {isDownloading ? "Generating PDF…" : "Download PDF"}
            </button>
            {downloadError ? (
              <p className="mt-2 text-sm text-red-600">{downloadError}</p>
            ) : null}
          </div>
        </form>

        <div className="rounded border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Preview
          </h2>
          <article className="prose prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // GFM task-list checkboxes here are read-only status markers
                // ("- [x] Expires...") whose containing text already states
                // the same fact in prose, so they're decorative, not inputs.
                // eslint-disable-next-line @typescript-eslint/no-unused-vars -- destructured only to exclude the AST node from the spread onto a DOM <input>
                input: ({ node: _node, ...props }) =>
                  props.type === "checkbox" ? (
                    <input {...props} aria-hidden="true" />
                  ) : (
                    <input {...props} />
                  ),
              }}
            >
              {mergedMarkdown}
            </ReactMarkdown>
          </article>
        </div>
      </div>
    </div>
  );
}
