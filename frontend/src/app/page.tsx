import NdaBuilder from "@/components/NdaBuilder";
import { readNdaTemplates } from "@/lib/nda/readTemplates";

export default function Home() {
  const { coverPageRaw, standardTermsRaw } = readNdaTemplates();

  return (
    <NdaBuilder coverPageRaw={coverPageRaw} standardTermsRaw={standardTermsRaw} />
  );
}
