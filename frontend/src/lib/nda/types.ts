export interface PartyInfo {
  name: string;
  title: string;
  company: string;
  noticeAddress: string;
}

export type MndaTermType = "fixed" | "ongoing";
export type ConfidentialityTermType = "fixed" | "perpetual";

export interface NdaFormData {
  purpose: string;
  effectiveDate: string;
  mndaTermType: MndaTermType;
  mndaTermYears: number;
  confidentialityTermType: ConfidentialityTermType;
  confidentialityTermYears: number;
  governingLaw: string;
  jurisdiction: string;
  partyOne: PartyInfo;
  partyTwo: PartyInfo;
}

const emptyParty = (): PartyInfo => ({
  name: "",
  title: "",
  company: "",
  noticeAddress: "",
});

export function createDefaultNdaFormData(): NdaFormData {
  return {
    purpose:
      "Evaluating whether to enter into a business relationship with the other party.",
    // Left blank here (rather than defaulting to `new Date()`) because this value
    // feeds a Client Component's initial state, which Next.js prerenders; the
    // actual "today" default is filled in client-side after mount.
    effectiveDate: "",
    mndaTermType: "fixed",
    mndaTermYears: 1,
    confidentialityTermType: "fixed",
    confidentialityTermYears: 1,
    governingLaw: "",
    jurisdiction: "",
    partyOne: emptyParty(),
    partyTwo: emptyParty(),
  };
}
