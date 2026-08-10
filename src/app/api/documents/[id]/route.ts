import { getErrorDetails } from "@/lib/api/errors";
import { RouteHandlerReturnType } from "@/lib/types";
import { GetDocumentByIdApiResponse } from "@/lib/validations/documents";
import { ulidSchema } from "@/lib/validations/shared";
import { ApiError } from "@/lib/api/errors";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  calculateDocumentTotalOrThrow,
  decimalToString,
} from "@/lib/rate-calculator";

export async function GET(
  ctx: RouteContext<"/api/documents/[id]">,
): RouteHandlerReturnType<GetDocumentByIdApiResponse> {
  try {
    const validatedPathParams = ulidSchema.safeParse((await ctx.params).id);

    if (!validatedPathParams.success) {
      throw new ApiError({
        message:
          validatedPathParams.error.issues[0]?.message ?? "Invalid input",
        httpStatusCode: 422,
      });
    }

    const document = await prisma.document.findFirst({
      where: {
        id: validatedPathParams.data,
      },
      select: {
        title: true,
        issueDate: true,
        customer: true,
        status: true,
        lineItems: {
          select: {
            description: true,
            quantity: true,
            unitPrice: true,
            discount: true,
            discountType: true,
            taxPercentage: true,
          },
        },
      },
    });

    if (!document) {
      throw new ApiError({
        message: "Document not found",
        httpStatusCode: 404,
      });
    }

    const {
      subTotal,
      discountAmount,
      taxAmount,
      grandTotal,
      calculatedLineItems,
    } = calculateDocumentTotalOrThrow(document.lineItems);

    return NextResponse.json({
      status: "success",
      message: "Document data fetched",
      data: {
        title: document.title,
        issueDate: document.issueDate.toDateString(),
        customer: document.customer,
        status: document.status,
        lineItems: calculatedLineItems,
        subTotal: decimalToString(subTotal),
        grandTotal: decimalToString(grandTotal),
        taxAmount: decimalToString(taxAmount),
        discountAmount: decimalToString(discountAmount),
      },
    });
  } catch (error) {
    console.error(error);

    const details = getErrorDetails({
      error,
      forEntity: "Document",
    });

    return NextResponse.json(
      { status: "error", message: details.message },
      { status: details.statusCode },
    );
  }
}
