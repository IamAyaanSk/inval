import { getErrorDetails } from "@/lib/api/errors";
import { RouteHandlerReturnType } from "@/lib/types";
import {
  GetDocumentByIdApiResponse,
  updateDocumentMetaApiRequestBodySchema,
  UpdateDocumentMetaApiResponse,
} from "@/lib/validations/documents";
import { ulidSchema } from "@/lib/validations/shared";
import { ApiError } from "@/lib/api/errors";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  calculateDocumentTotalOrThrow,
  decimalToString,
} from "@/lib/rate-calculator";
import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";

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
        id: validatedPathParams.data,
        userId: session.user.id,
      },
      select: {
        title: true,
        issueDate: true,
        customer: true,
        status: true,
        id: true,
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
        id: document.id,
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

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/documents/[id]">,
): RouteHandlerReturnType<UpdateDocumentMetaApiResponse> {
  try {
    const validatedPathParams = ulidSchema.safeParse((await ctx.params).id);
    const validatedRequestBody =
      updateDocumentMetaApiRequestBodySchema.safeParse(await request.json());

    if (!validatedPathParams.success) {
      throw new ApiError({
        message:
          validatedPathParams.error.issues[0]?.message ?? "Invalid input",
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
        id: validatedPathParams.data,
        userId: session.user.id,
      },
      select: {
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

    const updatedDocumentMeta = await prisma.document.update({
      where: {
        id: validatedPathParams.data,
        userId: session.user.id,
      },
      data: {
        title: validatedRequestBody.data.title,
        customer: validatedRequestBody.data.customer,
        issueDate: validatedRequestBody.data.issueDate,
      },
      select: {
        id: true,
        title: true,
        customer: true,
        issueDate: true,
      },
    });

    return NextResponse.json({
      status: "success",
      message: "Document updated successfully",
      data: {
        ...updatedDocumentMeta,

        issueDate: updatedDocumentMeta.issueDate.toDateString(),
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

export async function DELETE(
  ctx: RouteContext<"/api/documents/[id]">,
): RouteHandlerReturnType {
  try {
    const validatedPathParams = ulidSchema.safeParse((await ctx.params).id);

    if (!validatedPathParams.success) {
      throw new ApiError({
        message:
          validatedPathParams.error.issues[0]?.message ?? "Invalid input",
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
        id: validatedPathParams.data,
        userId: session.user.id,
      },
      select: {
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

    // Line items are cascade so deleting doc would delete items too, good for now
    await prisma.document.delete({
      where: {
        id: validatedPathParams.data,
      },
    });

    return NextResponse.json({
      status: "success",
      message: "Document deleted successfully",
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
