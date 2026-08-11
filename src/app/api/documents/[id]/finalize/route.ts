import { ApiError, getErrorDetails } from "@/lib/api/errors";
import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/db";
import { calculateDocumentTotalOrThrow } from "@/lib/rate-calculator";
import { RouteHandlerReturnType } from "@/lib/types";
import { ulidSchema } from "@/lib/validations/shared";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const PUT = async (
  _: Request,
  ctx: RouteContext<"/api/documents/[id]/finalize">,
): RouteHandlerReturnType => {
  try {
    const validatedDocumentId = ulidSchema.safeParse((await ctx.params).id);

    if (!validatedDocumentId.success) {
      throw new ApiError({
        message:
          validatedDocumentId.error.issues[0]?.message ?? "Invalid input",
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
        status: true,
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

    if (document == null) {
      throw new ApiError({
        message: "Document not found",
        httpStatusCode: 404,
      });
    }

    if (document.status === "FINALIZED") {
      throw new ApiError({
        message: "Document is already finalized",
        httpStatusCode: 422,
      });
    }

    const { discountAmount, taxAmount, grandTotal } =
      calculateDocumentTotalOrThrow(document.lineItems);

    await prisma.document.update({
      where: {
        id: validatedDocumentId.data,
        userId: session.user.id,
      },
      data: {
        status: "FINALIZED",
        grandTotal,
        totalDiscount: discountAmount,
        totalTax: taxAmount,
      },
    });

    return NextResponse.json({
      status: "success",
      message: "Finalized document successfully",
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
};
