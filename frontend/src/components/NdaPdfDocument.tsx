import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import {
  describeConfidentialityTerm,
  describeMndaTerm,
  formatDisplayDate,
  fillStandardTerms,
  splitStandardTermsClauses,
  stripMarkdownLinks,
} from "@/lib/nda/merge";
import { NdaFormData } from "@/lib/nda/types";

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 56,
    fontSize: 10.5,
    fontFamily: "Helvetica",
    lineHeight: 1.4,
  },
  title: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    marginBottom: 16,
    textAlign: "center",
  },
  sectionHeading: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginTop: 16,
    marginBottom: 8,
  },
  field: {
    marginBottom: 8,
  },
  fieldLabel: {
    fontFamily: "Helvetica-Bold",
  },
  bold: {
    fontFamily: "Helvetica-Bold",
  },
  clause: {
    marginBottom: 8,
    textAlign: "justify",
  },
  footer: {
    marginTop: 16,
    fontSize: 8.5,
    color: "#555555",
  },
  table: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#999999",
  },
  tableRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: "#999999",
  },
  tableRowFirst: {
    flexDirection: "row",
  },
  tableHeaderCell: {
    flex: 1,
    padding: 6,
    fontFamily: "Helvetica-Bold",
    borderLeftWidth: 1,
    borderColor: "#999999",
  },
  tableLabelCell: {
    flex: 1,
    padding: 6,
    fontFamily: "Helvetica-Bold",
  },
  tableCell: {
    flex: 1,
    padding: 6,
    borderLeftWidth: 1,
    borderColor: "#999999",
  },
});

function renderInline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <Text key={`${keyPrefix}-${i}`} style={styles.bold}>
          {part.slice(2, -2)}
        </Text>
      );
    }
    return <Text key={`${keyPrefix}-${i}`}>{part}</Text>;
  });
}

interface NdaPdfDocumentProps {
  data: NdaFormData;
  standardTermsRaw: string;
}

export default function NdaPdfDocument({
  data,
  standardTermsRaw,
}: NdaPdfDocumentProps) {
  const filledStandardTerms = fillStandardTerms(standardTermsRaw, data);
  const { clauses, footer } = splitStandardTermsClauses(filledStandardTerms);

  return (
    <Document title="Mutual Non-Disclosure Agreement">
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.title}>Mutual Non-Disclosure Agreement</Text>

        <Text style={styles.sectionHeading}>Cover Page</Text>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Purpose</Text>
          <Text>{data.purpose}</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Effective Date</Text>
          <Text>{formatDisplayDate(data.effectiveDate)}</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>MNDA Term</Text>
          <Text>{describeMndaTerm(data)}</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Term of Confidentiality</Text>
          <Text>{describeConfidentialityTerm(data)}</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Governing Law</Text>
          <Text>{data.governingLaw}</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Jurisdiction</Text>
          <Text>{data.jurisdiction}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableRowFirst}>
            <Text style={styles.tableLabelCell}> </Text>
            <Text style={styles.tableHeaderCell}>Party 1</Text>
            <Text style={styles.tableHeaderCell}>Party 2</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabelCell}>Print Name</Text>
            <Text style={styles.tableCell}>{data.partyOne.name}</Text>
            <Text style={styles.tableCell}>{data.partyTwo.name}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabelCell}>Title</Text>
            <Text style={styles.tableCell}>{data.partyOne.title}</Text>
            <Text style={styles.tableCell}>{data.partyTwo.title}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabelCell}>Company</Text>
            <Text style={styles.tableCell}>{data.partyOne.company}</Text>
            <Text style={styles.tableCell}>{data.partyTwo.company}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabelCell}>Notice Address</Text>
            <Text style={styles.tableCell}>{data.partyOne.noticeAddress}</Text>
            <Text style={styles.tableCell}>{data.partyTwo.noticeAddress}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabelCell}>Signature / Date</Text>
            <Text style={styles.tableCell}> </Text>
            <Text style={styles.tableCell}> </Text>
          </View>
        </View>
      </Page>

      <Page size="LETTER" style={styles.page}>
        <Text style={styles.sectionHeading}>Standard Terms</Text>
        {clauses.map((clause, i) => (
          <Text key={i} style={styles.clause}>
            {renderInline(stripMarkdownLinks(clause), `clause-${i}`)}
          </Text>
        ))}
        {footer ? (
          <Text style={styles.footer}>
            {renderInline(stripMarkdownLinks(footer), "footer")}
          </Text>
        ) : null}
      </Page>
    </Document>
  );
}
