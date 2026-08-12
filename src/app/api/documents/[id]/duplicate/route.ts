import { ApiError, getErrorDetails } from "@/lib/api/errors";
import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/db";
import { RouteHandlerReturnType } from "@/lib/types";
import { ulidSchema } from "@/lib/validations/shared";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const POST = async (
  _: Request,
  ctx: RouteContext<"/api/documents/[id]/duplicate">,
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

    const sourceDocument = await prisma.document.findFirst({
      where: {
        id: validatedDocumentId.data,
        userId: session.user.id,
      },
      include: {
        lineItems: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!sourceDocument) {
      throw new ApiError({
        message: "Document not found",
        httpStatusCode: 404,
      });
    }

    const duplicatedDocument = await prisma.$transaction(async (tx) => {
      const newDocument = await tx.document.create({
        data: {
          userId: session.user.id,
          title: `${sourceDocument.title} (Duplicate)`,
          customer: sourceDocument.customer,
          issueDate: sourceDocument.issueDate,
          status: "DRAFT",
          lineItems: {
            create: sourceDocument.lineItems.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.discount,
              discountType: item.discountType,
              taxPercentage: item.taxPercentage,
            })),
          },
        },
        select: {
          id: true,
        },
      });

      return newDocument;
    });

    return NextResponse.json({
      status: "success",
      data: duplicatedDocument,
      message: "Document duplicated successfully",
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
