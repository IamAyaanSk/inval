import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import type { GetDocumentByIdApiResponse } from "@/lib/validations/documents";
import { FileText } from "lucide-react";

type DocumentData = GetDocumentByIdApiResponse["data"];

export function DocumentPreview({ document }: { document: DocumentData }) {
  const isFinalized = document.status === "FINALIZED";

  return (
    <div className="flex flex-col gap-6 rounded-2xl border bg-card p-6 md:p-8 shadow-xs text-card-foreground">
      <div className="flex items-start justify-between border-b pb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {document.title || "Untitled Document"}
            </h1>
            <Badge
              variant={isFinalized ? "default" : "outline"}
              className={cn(
                "text-xs px-2 py-0.5 font-semibold tracking-wide",
                isFinalized
                  ? "bg-primary text-primary-foreground border-transparent"
                  : "bg-background text-muted-foreground border-border",
              )}
            >
              {isFinalized ? "Finalized" : "Draft"}
            </Badge>
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Customer:{" "}
            <span className="text-foreground">
              {document.customer || "N/A"}
            </span>
          </p>
        </div>

        <div className="flex flex-col items-end gap-1 text-right">
          <div className="flex items-center gap-1.5 text-primary font-bold tracking-wider uppercase text-sm">
            <FileText className="size-4" />
            <span>INVAL</span>
          </div>
          <span className="text-xs text-muted-foreground">
            Date: {formatDate(document.issueDate)}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <th className="py-3 px-3">Item / Description</th>
              <th className="py-3 px-3 text-right">Rate</th>
              <th className="py-3 px-3 text-right">Qty</th>
              <th className="py-3 px-3 text-right">Subtotal</th>
              <th className="py-3 px-3 text-right">Discount</th>
              <th className="py-3 px-3 text-right">Tax</th>
              <th className="py-3 px-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {document.lineItems.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-8 text-center text-muted-foreground text-xs"
                >
                  No line items added yet
                </td>
              </tr>
            ) : (
              document.lineItems.map((item) => (
                <tr key={item.id} className="hover:bg-muted/20">
                  <td className="py-3 px-3 font-medium">{item.description}</td>
                  <td className="py-3 px-3 text-right text-muted-foreground">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="py-3 px-3 text-right text-muted-foreground">
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
                  <td className="py-3 px-3 text-right font-medium">
                    {formatCurrency(item.lineTotal)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-end gap-2 text-sm pt-2">
        <div className="flex justify-between w-60 text-muted-foreground">
          <span>Subtotal</span>
          <span className="font-medium text-foreground">
            {formatCurrency(document.subTotal)}
          </span>
        </div>
        <div className="flex justify-between w-60 text-muted-foreground">
          <span>Tax</span>
          <span className="font-medium text-foreground">
            {formatCurrency(document.taxAmount)}
          </span>
        </div>
        <div className="flex justify-between w-60 text-muted-foreground">
          <span>Discount</span>
          <span className="font-medium text-foreground">
            {formatCurrency(document.discountAmount)}
          </span>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between rounded-xl bg-primary px-6 py-5 text-primary-foreground shadow-sm">
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold opacity-90">
            Total Amount
          </p>
          <p className="text-[11px] opacity-75">
            Issue Date: {formatDate(document.issueDate)}
          </p>
        </div>
        <p className="text-2xl md:text-3xl font-bold tracking-tight">
          {formatCurrency(document.grandTotal)}
        </p>
      </div>
    </div>
  );
}
