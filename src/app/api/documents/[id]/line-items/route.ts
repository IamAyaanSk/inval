import { ApiError, getErrorDetails } from "@/lib/api/errors";
import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/db";
import { calculateDocumentTotalOrThrow } from "@/lib/rate-calculator";
import { RouteHandlerReturnType } from "@/lib/types";
import {
  CreateLineItemApiResponse,
  createLineItemRequestBodySchema,
} from "@/lib/validations/line-items";
import { ulidSchema } from "@/lib/validations/shared";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const POST = async (
  request: Request,
  ctx: RouteContext<"/api/documents/[id]/line-items">,
): RouteHandlerReturnType<CreateLineItemApiResponse> => {
  try {
    const validatedDocumentId = ulidSchema.safeParse((await ctx.params).id);
    const validatedRequestBody = createLineItemRequestBodySchema.safeParse(
      await request.json(),
    );

    if (!validatedDocumentId.success) {
      throw new ApiError({
        message:
          validatedDocumentId.error.issues[0]?.message ?? "Invalid input",
        httpStatusCode: 422,
      });
    }

    if (!validatedRequestBody.success) {
      throw new ApiError({
        message:
          validatedRequestBody.error.issues[0]?.message ?? "Invalid input",
        httpStatusCode: 422,
      });
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new ApiError({
        message: "You are not authorized for this action",
        httpStatusCode: 401,
      });
    }

    const document = await prisma.document.findFirst({
      where: {
        id: validatedDocumentId.data,
        userId: session.user.id,
      },

      select: {
        id: true,
        status: true,
      },
    });

    if (document == null) {
      throw new ApiError({
        message: "Document not found",
        httpStatusCode: 404,
      });
    }

    if (document.status === "FINALIZED") {
      throw new ApiError({
        message: "Only draft documents can be edited",
        httpStatusCode: 422,
      });
    }

    const createdLineItem = await prisma.lineItem.create({
      data: {
        ...validatedRequestBody.data,
        documentId: validatedDocumentId.data,
      },
      select: {
        id: true,
      },
    });

    // Refetch to get latest line items data
    const freshDocument = await prisma.document.findFirst({
      where: {
        id: document.id,
      },
      select: {
        lineItems: {
          select: {
            id: true,
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

    // This should never happen
    if (freshDocument == null) {
      console.error(
        `🚨🚨🚨 Inconsistent document with id ${validatedDocumentId.data} found`,
      );
      throw new ApiError({
        message: "Something went wrong",
        httpStatusCode: 404,
      });
    }

    const {
      subTotal,
      discountAmount,
      taxAmount,
      grandTotal,
      calculatedLineItems,
    } = calculateDocumentTotalOrThrow(freshDocument.lineItems);

    const newLineItem = calculatedLineItems.find(
      (calculatedLineItem) => calculatedLineItem.id === createdLineItem.id,
    );

    // This should never happen
    if (!newLineItem) {
      console.error(
        `🚨🚨🚨 Inconsistent line item with id ${validatedDocumentId.data} found for document id ${document.id}`,
      );

      throw new ApiError({
        message: "Something went wrong!",
        httpStatusCode: 500,
      });
    }

    return NextResponse.json({
      status: "success",
      message: "Created line item successfully",
      data: {
        lineItem: newLineItem,
        documentTotals: {
          subTotal,
          discountAmount,
          taxAmount,
          grandTotal,
        },
      },
    });
  } catch (error) {
    console.error(error);

    const details = getErrorDetails({
      error,
      forEntity: "Line item",
    });

    return NextResponse.json(
      { status: "error", message: details.message },
      { status: details.statusCode },
    );
  }
};
