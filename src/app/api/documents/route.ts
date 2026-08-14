import { ApiError, getErrorDetails } from "@/lib/api/errors";
import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/db";
import { RouteHandlerReturnType } from "@/lib/types";
import {
  createDocumentApiRequestBodySchema,
  CreateDocumentApiResponseSchema,
  ListDocumentsApiResponse,
} from "@/lib/validations/documents";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const GET =
  async (): RouteHandlerReturnType<ListDocumentsApiResponse> => {
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session) {
        throw new ApiError({
          message: "You are not authorized for this action",
          httpStatusCode: 401,
        });
      }

      const documents = await prisma.document.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 500,
        select: {
          id: true,
          title: true,
          customer: true,
          issueDate: true,
          status: true,
        },
      });

      return NextResponse.json({
        status: "success",
        message: "Documents fetched",
        data: {
          documents: documents.map((doc) => ({
            ...doc,
            issueDate: doc.issueDate.toISOString(),
          })),
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

    const newDocument = await prisma.document.create({
      data: {
        ...validatedRequestBody.data,
        status: "DRAFT",
        userId: session.user.id,
      },
      select: {
        id: true,
      },
    });

    return NextResponse.json({
      status: "success",
      message: "Created document successfully",
      data: {
        id: newDocument.id,
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
