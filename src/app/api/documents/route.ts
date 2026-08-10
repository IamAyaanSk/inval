import { ApiError, getErrorDetails } from "@/lib/api/errors";
import { auth } from "@/lib/auth/server";
import { DEFAULT_LINE_ITEM } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { RouteHandlerReturnType } from "@/lib/types";
import {
  createDocumentApiRequestBodySchema,
  CreateDocumentApiResponseSchema,
} from "@/lib/validations/documents";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const POST = async (
  request: Request,
): RouteHandlerReturnType<CreateDocumentApiResponseSchema> => {
  try {
    const validatedRequestBody = createDocumentApiRequestBodySchema.safeParse(
      await request.json(),
    );

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

    const newDocumentId = await prisma.$transaction(async (tx) => {
      const createdDocument = await tx.document.create({
        data: {
          ...validatedRequestBody.data,
          status: "DRAFT",
          userId: session.user.id,
        },
        select: {
          id: true,
        },
      });

      // Create initial line item
      await tx.lineItem.create({
        data: {
          ...DEFAULT_LINE_ITEM,
          documentId: createdDocument.id,
        },
      });

      return createdDocument.id;
    });

    return NextResponse.json({
      status: "success",
      message: "Created document successfully",
      data: {
        id: newDocumentId,
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
};
