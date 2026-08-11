import { ApiError, getErrorDetails } from "@/lib/api/errors";
import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/db";
import { calculateDocumentTotalOrThrow } from "@/lib/rate-calculator";
import { RouteHandlerReturnType } from "@/lib/types";
import {
  DeleteLineItemApiResponse,
  UpdateLineItemApiResponse,
  updateLineItemRequestBodySchema,
} from "@/lib/validations/line-items";
import { ulidSchema } from "@/lib/validations/shared";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const PUT = async (
  request: Request,
  ctx: RouteContext<"/api/documents/[id]/line-items/[itemId]">,
): RouteHandlerReturnType<UpdateLineItemApiResponse> => {
  try {
    const validatedDocumentId = ulidSchema.safeParse((await ctx.params).id);
    const validatedLineItemId = ulidSchema.safeParse((await ctx.params).itemId);
    const validatedRequestBody = updateLineItemRequestBodySchema.safeParse(
      await request.json(),
    );

    if (!validatedDocumentId.success) {
      throw new ApiError({
        message:
          validatedDocumentId.error.issues[0]?.message ?? "Invalid input",
        httpStatusCode: 422,
      });
    }

    if (!validatedLineItemId.success) {
      throw new ApiError({
        message:
          validatedLineItemId.error.issues[0]?.message ?? "Invalid input",
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

    const lineItem = await prisma.lineItem.findFirst({
      where: {
        id: validatedLineItemId.data,
        documentId: validatedDocumentId.data,
        document: {
          userId: session.user.id,
        },
      },

      select: {
        document: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (lineItem == null) {
      throw new ApiError({
        message: "Line item not found",
        httpStatusCode: 404,
      });
    }

    if (lineItem.document.status === "FINALIZED") {
      throw new ApiError({
        message: "Only draft documents can be edited",
        httpStatusCode: 422,
      });
    }

    await prisma.lineItem.update({
      where: {
        id: validatedLineItemId.data,
        documentId: validatedDocumentId.data,
        document: {
          userId: session.user.id,
        },
      },
      data: {
        ...validatedRequestBody.data,
      },
    });

    const document = await prisma.document.findFirst({
      where: {
        id: lineItem.document.id,
      },
      select: {
        lineItems: {
          orderBy: {
            createdAt: "asc",
          },
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
    if (document == null) {
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
    } = calculateDocumentTotalOrThrow(document.lineItems);

    const updatedLineItem = calculatedLineItems.find(
      (calculatedLineItem) =>
        calculatedLineItem.id === validatedLineItemId.data,
    );

    // This should never happen
    if (!updatedLineItem) {
      console.error(
        `🚨🚨🚨 Inconsistent line item with id ${validatedLineItemId.data} found for document id ${validatedDocumentId.data}`,
      );

      throw new ApiError({
        message: "Something went wrong!",
        httpStatusCode: 500,
      });
    }

    return NextResponse.json({
      status: "success",
      message: "Updated line item successfully",
      data: {
        lineItem: updatedLineItem,
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

export const DELETE = async (
  _: Request,
  ctx: RouteContext<"/api/documents/[id]/line-items/[itemId]">,
): RouteHandlerReturnType<DeleteLineItemApiResponse> => {
  try {
    const validatedDocumentId = ulidSchema.safeParse((await ctx.params).id);
    const validatedLineItemId = ulidSchema.safeParse((await ctx.params).itemId);

    if (!validatedDocumentId.success) {
      throw new ApiError({
        message:
          validatedDocumentId.error.issues[0]?.message ?? "Invalid input",
        httpStatusCode: 422,
      });
    }

    if (!validatedLineItemId.success) {
      throw new ApiError({
        message:
          validatedLineItemId.error.issues[0]?.message ?? "Invalid input",
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

    const lineItem = await prisma.lineItem.findFirst({
      where: {
        id: validatedLineItemId.data,
        document: {
          id: validatedDocumentId.data,
          userId: session.user.id,
        },
      },

      select: {
        document: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (lineItem == null) {
      throw new ApiError({
        message: "Line item not found",
        httpStatusCode: 404,
      });
    }

    if (lineItem.document.status === "FINALIZED") {
      throw new ApiError({
        message: "Only draft documents can be edited",
        httpStatusCode: 422,
      });
    }

    await prisma.lineItem.delete({
      where: {
        id: validatedLineItemId.data,
        document: {
          id: validatedDocumentId.data,
          userId: session.user.id,
        },
      },
    });

    const document = await prisma.document.findFirst({
      where: {
        id: lineItem.document.id,
      },
      select: {
        lineItems: {
          orderBy: {
            createdAt: "asc",
          },
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
    if (document == null) {
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
    } = calculateDocumentTotalOrThrow(document.lineItems);

    const deletedLineItem = calculatedLineItems.find(
      (calculatedLineItem) =>
        calculatedLineItem.id === validatedLineItemId.data,
    );

    // This should never happen
    if (deletedLineItem) {
      console.error(
        `🚨🚨🚨 Inconsistent line item with id ${validatedLineItemId.data} found for document id ${validatedDocumentId}`,
      );

      throw new ApiError({
        message: "Something went wrong!",
        httpStatusCode: 500,
      });
    }

    return NextResponse.json({
      status: "success",
      message: "Deleted line item successfully",
      data: {
        lineItemId: validatedLineItemId.data,
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
