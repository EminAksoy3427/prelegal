import type { Metadata } from "next";
import NdaBuilder from "@/components/NdaBuilder";
import PlatformShell from "@/components/PlatformShell";
import { readNdaTemplates } from "@/lib/nda/readTemplates";

export const metadata: Metadata = {
  title: "Mutual NDA Creator | Prelegal",
  description: "Generate a Common Paper Mutual NDA.",
};

export default function NdaPage() {
  const { coverPageRaw, standardTermsRaw } = readNdaTemplates();

  return (
    <PlatformShell>
      <NdaBuilder coverPageRaw={coverPageRaw} standardTermsRaw={standardTermsRaw} />
    </PlatformShell>
  );
}
