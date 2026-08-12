import { formatCurrency, formatDate } from "@/lib/utils";
import type { GetDocumentByIdApiResponse } from "@/lib/validations/documents";

type DocumentData = GetDocumentByIdApiResponse["data"];

export function DocumentPreview({ document }: { document: DocumentData }) {
  return (
    <div
      id="printable-document"
      className="flex flex-col rounded-2xl border bg-card shadow-xs text-card-foreground overflow-hidden"
    >
      <div className="p-6 md:p-8 flex flex-col gap-6">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground">
            {document.title}
          </h1>
          <p className="text-xs font-bold text-primary font-mono">
            #{document.id.slice(-6).toUpperCase()}
          </p>
        </div>

        <div className="flex flex-col gap-0.5 text-xs pt-1">
          <span className="text-muted-foreground">Billed To</span>
          <span className="font-semibold text-foreground text-sm">
            {document.customer}
          </span>
        </div>

        <div className="rounded-xl overflow-hidden mt-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground font-semibold">
                  <th className="py-3 px-3">Deliverable</th>
                  <th className="py-3 px-3 text-right">Rate</th>
                  <th className="py-3 px-3 text-center">Qty</th>
                  <th className="py-3 px-3 text-right">Subtotal</th>
                  <th className="py-3 px-3 text-right">Discount</th>
                  <th className="py-3 px-3 text-right">Tax</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {document.lineItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-8 text-center text-muted-foreground text-xs"
                    >
                      No deliverables added yet
                    </td>
                  </tr>
                ) : (
                  document.lineItems.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-muted/10 transition-colors"
                    >
                      <td className="py-3 px-3 font-medium text-foreground">
                        {item.description}
                      </td>
                      <td className="py-3 px-3 text-right text-muted-foreground">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="py-3 px-3 text-center text-muted-foreground">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-3 text-right text-muted-foreground">
                        {formatCurrency(item.lineSubTotal)}
                      </td>
                      <td className="py-3 px-3 text-right text-muted-foreground">
                        -{formatCurrency(item.lineDiscountAmount)}
                      </td>
                      <td className="py-3 px-3 text-right text-muted-foreground">
                        +{formatCurrency(item.lineTaxAmount)}
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-foreground">
                        {formatCurrency(item.lineTotal)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Subtotals Summary Breakdown */}
        <div className="flex flex-col items-end gap-1.5 text-xs pt-1">
          <div className="flex justify-between w-56 text-muted-foreground">
            <span>SubTotal</span>
            <span className="font-semibold text-foreground">
              {formatCurrency(document.subTotal)}
            </span>
          </div>
          <div className="flex justify-between w-56 text-muted-foreground">
            <span>Discount</span>
            <span className="font-semibold text-foreground">
              -{formatCurrency(document.discountAmount)}
            </span>
          </div>
          <div className="flex justify-between w-56 text-muted-foreground">
            <span>Tax</span>
            <span className="font-semibold text-foreground">
              +{formatCurrency(document.taxAmount)}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-primary text-primary-foreground p-6 md:p-8 flex items-center justify-between mt-auto">
        <div className="flex flex-col gap-1 text-xs">
          <span className="font-semibold text-primary-foreground/90">
            Invoice Details
          </span>
          <span className="text-primary-foreground/75">
            Date Issued: {formatDate(document.issueDate)}
          </span>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-primary-foreground/80">
            Total amount
          </span>
          <span className="text-2xl md:text-4xl font-extrabold tracking-tight">
            {formatCurrency(document.grandTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}
