import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import { brandDisplayName } from "@/config/branding";
import { formatPkr } from "@/features/invoices/lib/format-pkr";
import { normalizeOptionalInvoiceNote } from "@/features/invoices/lib/normalize-optional-invoice-note";
import {
  invoicePdfLabels,
  type InvoiceLocale,
} from "@/features/invoices/lib/invoice-labels";
import {
  formatPaymentMethodDetails,
  getPaymentMethodName,
  type PaymentMethodDisplayFields,
} from "@/features/payment-methods/lib/format-payment-method";

export type InvoicePdfLineItem = {
  label: string;
  description?: string | null;
  amount: number;
  isOfficialFee: boolean;
};

export type InvoicePdfPaymentMethod = PaymentMethodDisplayFields & {
  qrCodeDataUri?: string | null;
};

export type InvoicePdfData = {
  locale: InvoiceLocale;
  brandMarkSrc: string;
  invoiceNumber: string;
  trackingId: string;
  serviceName: string;
  customerName: string;
  issueDate: string;
  dueDate?: string | null;
  lineItems: InvoicePdfLineItem[];
  subtotal: number;
  taxTotal: number;
  total: number;
  paymentMethod?: string | null;
  paymentMethods?: InvoicePdfPaymentMethod[];
  paymentInstructions?: string | null;
  officialFeeNote?: string | null;
  notes?: string | null;
};

const brandPrimary = "#2159BA";
const brandSecondary = "#FAC515";
const slate900 = "#111827";
const slate700 = "#374151";
const slate600 = "#4B5563";
const slate500 = "#6B7280";
const slate200 = "#E5E7EB";
const slate50 = "#F9FAFB";

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontSize: 8.5,
    fontFamily: "Helvetica",
    color: slate900,
    backgroundColor: "#FFFFFF",
  },
  headerBar: {
    backgroundColor: brandPrimary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandIconImage: {
    width: 48,
    height: 48,
    marginRight: 12,
    objectFit: "contain",
  },
  brandName: {
    fontSize: 16,
    fontWeight: 700,
    color: "#FFFFFF",
  },
  headerRight: {
    alignItems: "flex-end",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#FFFFFF",
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: 8,
    color: "#DBEAFE",
  },
  accentBar: {
    height: 3,
    backgroundColor: brandSecondary,
  },
  body: {
    paddingHorizontal: 28,
    paddingTop: 12,
    paddingBottom: 16,
  },
  metaStrip: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: slate200,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 10,
  },
  metaCol: {
    flex: 1,
    padding: 8,
    backgroundColor: slate50,
    borderRightWidth: 1,
    borderRightColor: slate200,
  },
  metaColLast: {
    flex: 0.85,
    padding: 8,
    backgroundColor: "#EFF6FF",
    borderRightWidth: 0,
  },
  metaLabel: {
    fontSize: 6.5,
    color: slate500,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 1,
  },
  metaValue: {
    fontSize: 8,
    fontWeight: 700,
    color: slate900,
    marginBottom: 4,
  },
  totalDueValue: {
    fontSize: 14,
    fontWeight: 700,
    color: brandPrimary,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 700,
    marginBottom: 5,
    color: brandPrimary,
    paddingBottom: 2,
    borderBottomWidth: 1.5,
    borderBottomColor: brandSecondary,
  },
  table: {
    borderWidth: 1,
    borderColor: slate200,
    borderRadius: 6,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: brandPrimary,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  tableHeaderText: {
    color: "#FFFFFF",
    fontWeight: 700,
    fontSize: 7.5,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: slate200,
    backgroundColor: "#FFFFFF",
  },
  tableRowAlt: {
    backgroundColor: slate50,
  },
  tableTotalRow: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: slate200,
    backgroundColor: "#FFFFFF",
  },
  colLabel: { width: "68%" },
  colAmount: { width: "32%", textAlign: "right" },
  itemTitle: {
    fontSize: 8.5,
    fontWeight: 700,
    color: slate900,
  },
  itemDescription: {
    fontSize: 7,
    color: slate500,
    marginTop: 1,
    lineHeight: 1.25,
  },
  officialBadge: {
    fontSize: 7,
    color: slate600,
  },
  totalLabel: {
    color: slate600,
    fontSize: 7.5,
  },
  totalValue: {
    fontWeight: 700,
    fontSize: 7.5,
  },
  grandTotalRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: brandPrimary,
  },
  grandTotalLabel: {
    color: "#FFFFFF",
    fontWeight: 700,
    fontSize: 8.5,
  },
  grandTotalValue: {
    color: brandSecondary,
    fontWeight: 700,
    fontSize: 9.5,
    textAlign: "right",
  },
  noticeBox: {
    borderLeftWidth: 3,
    borderLeftColor: "#F59E0B",
    borderWidth: 1,
    borderColor: "#FDE68A",
    backgroundColor: "#FFFBEB",
    borderRadius: 6,
    padding: 7,
    marginBottom: 8,
  },
  noticeTitle: {
    fontSize: 8,
    fontWeight: 700,
    color: "#92400E",
    marginBottom: 2,
  },
  noticeBody: {
    fontSize: 7.5,
    color: "#78350F",
    lineHeight: 1.35,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  paymentCard: {
    width: "48.5%",
    borderWidth: 1,
    borderColor: slate200,
    borderLeftWidth: 3,
    borderLeftColor: brandPrimary,
    borderRadius: 6,
    padding: 7,
    backgroundColor: slate50,
  },
  paymentCardFull: {
    width: "100%",
    borderWidth: 1,
    borderColor: slate200,
    borderLeftWidth: 3,
    borderLeftColor: brandPrimary,
    borderRadius: 6,
    padding: 7,
    marginBottom: 5,
    backgroundColor: slate50,
  },
  paymentCardTitle: {
    fontSize: 8,
    fontWeight: 700,
    color: brandPrimary,
    marginBottom: 3,
  },
  paymentLine: {
    fontSize: 7,
    color: slate700,
    marginBottom: 1,
    lineHeight: 1.25,
  },
  paymentQrHint: {
    fontSize: 6.5,
    color: slate500,
    marginTop: 4,
    marginBottom: 2,
    textAlign: "center",
  },
  paymentQrImage: {
    width: 150,
    marginTop: 2,
    marginBottom: 2,
    alignSelf: "center",
    objectFit: "contain",
  },
  noteRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  noteBox: {
    width: "48.5%",
    borderWidth: 1,
    borderColor: slate200,
    borderRadius: 6,
    padding: 7,
    marginBottom: 5,
    backgroundColor: slate50,
  },
  noteBoxFull: {
    width: "100%",
    borderWidth: 1,
    borderColor: slate200,
    borderRadius: 6,
    padding: 7,
    marginBottom: 5,
    backgroundColor: slate50,
  },
  noteTitle: {
    fontSize: 7.5,
    fontWeight: 700,
    color: brandPrimary,
    marginBottom: 2,
  },
  noteText: {
    fontSize: 7,
    color: slate700,
    lineHeight: 1.3,
  },
  footer: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: slate200,
  },
  footerDisclaimer: {
    fontSize: 6.5,
    color: slate500,
    lineHeight: 1.3,
    textAlign: "center",
  },
});

function formatInvoiceDate(value: string, locale: InvoiceLocale): string {
  const date = new Date(value.includes("T") ? value : `${value}T12:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
  }).format(date);
}

function MetaField({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

function PaymentMethodCard({
  method,
  locale,
  labels,
  compact,
}: {
  method: InvoicePdfPaymentMethod;
  locale: InvoiceLocale;
  labels: (typeof invoicePdfLabels)[InvoiceLocale];
  compact?: boolean;
}) {
  const lines = formatPaymentMethodDetails(method, {
    accountTitle: labels.accountTitle,
    accountNumber: labels.accountNumber,
    iban: labels.iban,
    bankName: labels.bankName,
    instructions: labels.instructions,
  });

  return (
    <View style={compact ? styles.paymentCard : styles.paymentCardFull}>
      <Text style={styles.paymentCardTitle}>
        {getPaymentMethodName(method)}
      </Text>
      {lines.slice(1).map((line, lineIndex) => (
        <Text key={`payment-line-${lineIndex}`} style={styles.paymentLine}>
          {line}
        </Text>
      ))}
      {method.qrCodeDataUri ? (
        <View>
          <Text style={styles.paymentQrHint}>{labels.scanQr}</Text>
          <Image src={method.qrCodeDataUri} style={styles.paymentQrImage} />
        </View>
      ) : null}
    </View>
  );
}

export function InvoicePdfDocument({ data }: { data: InvoicePdfData }) {
  const labels = invoicePdfLabels[data.locale];
  const issueDateLabel = formatInvoiceDate(data.issueDate, data.locale);
  const dueDateLabel = data.dueDate
    ? formatInvoiceDate(data.dueDate, data.locale)
    : null;
  const paymentMethods = data.paymentMethods ?? [];
  const useCompactPaymentRow = paymentMethods.length === 2;

  const paymentInstructions = normalizeOptionalInvoiceNote(data.paymentInstructions);
  const officialFeeNote = normalizeOptionalInvoiceNote(data.officialFeeNote);
  const notes = normalizeOptionalInvoiceNote(data.notes);

  const noteBlocks: Array<{ title: string; text: string }> = [];
  if (paymentInstructions) {
    noteBlocks.push({
      title: labels.paymentInstructions,
      text: paymentInstructions,
    });
  }
  if (officialFeeNote) {
    noteBlocks.push({ title: labels.officialFeeNote, text: officialFeeNote });
  }
  if (notes) {
    noteBlocks.push({ title: labels.notes, text: notes });
  }

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.headerBar}>
          <View style={styles.brandRow}>
            <Image src={data.brandMarkSrc} style={styles.brandIconImage} />
            <Text style={styles.brandName}>{brandDisplayName}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerTitle}>{labels.title}</Text>
            <Text style={styles.headerSubtitle}>{data.invoiceNumber}</Text>
          </View>
        </View>
        <View style={styles.accentBar} />

        <View style={styles.body}>
          <View style={styles.metaStrip}>
            <View style={styles.metaCol}>
              <MetaField label={labels.trackingId} value={data.trackingId} />
              <MetaField label={labels.issueDate} value={issueDateLabel} />
              {dueDateLabel ? (
                <MetaField label={labels.dueDate} value={dueDateLabel} />
              ) : null}
            </View>
            <View style={styles.metaCol}>
              <MetaField label={labels.service} value={data.serviceName} />
              <MetaField label={labels.customer} value={data.customerName} />
            </View>
            <View style={styles.metaColLast}>
              <Text style={styles.metaLabel}>{labels.total}</Text>
              <Text style={styles.totalDueValue}>
                {formatPkr(data.total, data.locale)}
              </Text>
              <Text style={[styles.metaLabel, { marginTop: 4 }]}>{labels.subtotal}</Text>
              <Text style={styles.metaValue}>
                {formatPkr(data.subtotal, data.locale)}
              </Text>
              <Text style={styles.metaLabel}>{labels.tax}</Text>
              <Text style={styles.metaValue}>
                {formatPkr(data.taxTotal, data.locale)}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{labels.lineItems}</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.colLabel]}>
                  {labels.description}
                </Text>
                <Text style={[styles.tableHeaderText, styles.colAmount]}>
                  {labels.amount}
                </Text>
              </View>
              {data.lineItems.map((item, index) => (
                <View
                  key={`${item.label}-${index}`}
                  style={[
                    styles.tableRow,
                    index % 2 === 1 ? styles.tableRowAlt : {},
                  ]}
                >
                  <View style={styles.colLabel}>
                    <Text style={styles.itemTitle}>
                      {item.label}
                      {item.isOfficialFee ? (
                        <Text style={styles.officialBadge}>
                          {` (${labels.governmentFees})`}
                        </Text>
                      ) : null}
                    </Text>
                    {item.description ? (
                      <Text style={styles.itemDescription}>{item.description}</Text>
                    ) : null}
                  </View>
                  <Text style={[styles.colAmount, styles.itemTitle]}>
                    {formatPkr(item.amount, data.locale)}
                  </Text>
                </View>
              ))}
              <View style={styles.tableTotalRow}>
                <Text style={[styles.colLabel, styles.totalLabel]}>
                  {labels.subtotal}
                </Text>
                <Text style={[styles.colAmount, styles.totalValue]}>
                  {formatPkr(data.subtotal, data.locale)}
                </Text>
              </View>
              <View style={styles.tableTotalRow}>
                <Text style={[styles.colLabel, styles.totalLabel]}>{labels.tax}</Text>
                <Text style={[styles.colAmount, styles.totalValue]}>
                  {formatPkr(data.taxTotal, data.locale)}
                </Text>
              </View>
              <View style={styles.grandTotalRow}>
                <Text style={[styles.colLabel, styles.grandTotalLabel]}>
                  {labels.total}
                </Text>
                <Text style={[styles.colAmount, styles.grandTotalValue]}>
                  {formatPkr(data.total, data.locale)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.noticeBox}>
            <Text style={styles.noticeTitle}>{labels.exactPaymentTitle}</Text>
            <Text style={styles.noticeBody}>{labels.exactPaymentNotice}</Text>
          </View>

          {paymentMethods.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{labels.paymentMethod}</Text>
              {useCompactPaymentRow ? (
                <View style={styles.paymentRow}>
                  {paymentMethods.map((method, index) => (
                    <PaymentMethodCard
                      key={`payment-method-${index}`}
                      method={method}
                      locale={data.locale}
                      labels={labels}
                      compact
                    />
                  ))}
                </View>
              ) : (
                paymentMethods.map((method, index) => (
                  <PaymentMethodCard
                    key={`payment-method-${index}`}
                    method={method}
                    locale={data.locale}
                    labels={labels}
                  />
                ))
              )}
            </View>
          ) : data.paymentMethod ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{labels.paymentMethod}</Text>
              <View style={styles.noteBoxFull}>
                <Text style={styles.noteText}>{data.paymentMethod}</Text>
              </View>
            </View>
          ) : null}

          {noteBlocks.length > 0 ? (
            <View style={styles.section}>
              <View
                style={
                  noteBlocks.length > 1 ? styles.noteRow : { flexDirection: "column" }
                }
              >
                {noteBlocks.map((block, index) => (
                  <View
                    key={`note-${index}`}
                    style={
                      noteBlocks.length > 1 ? styles.noteBox : styles.noteBoxFull
                    }
                  >
                    <Text style={styles.noteTitle}>{block.title}</Text>
                    <Text style={styles.noteText}>{block.text}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.footer}>
            <Text style={styles.footerDisclaimer}>{labels.disclaimer}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
