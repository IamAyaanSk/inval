import { ApiError, getErrorDetails } from "@/lib/api/errors";
import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/db";
import { decimalToString } from "@/lib/rate-calculator";
import { RouteHandlerReturnType } from "@/lib/types";
import {
  DocumentSummaryApiResponse,
  documentSummaryQueryParamsSchema,
} from "@/lib/validations/documents";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  request: NextRequest,
): RouteHandlerReturnType<DocumentSummaryApiResponse> => {
  try {
    const validatedQueryParams = documentSummaryQueryParamsSchema.safeParse({
      from: request.nextUrl.searchParams.get("from"),
      to: request.nextUrl.searchParams.get("to"),
    });

    if (!validatedQueryParams.success) {
      throw new ApiError({
        message:
          validatedQueryParams.error.issues[0]?.message ?? "Invalid input",
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

    const { from, to } = validatedQueryParams.data;

    const dateRangeFilter = {
      userId: session.user.id,
      issueDate: {
        gte: new Date(from),
        lte: new Date(to),
      },
    } as const;

    const [
      totalCount,
      draftCount,
      finalizedCount,
      aggregation,
      recentDraftDocuments,
      recentFinalizedDocuments,
    ] = await Promise.all([
      prisma.document.count({
        where: dateRangeFilter,
      }),
      prisma.document.count({
        where: { ...dateRangeFilter, status: "DRAFT" },
      }),
      prisma.document.count({
        where: { ...dateRangeFilter, status: "FINALIZED" },
      }),
      prisma.document.aggregate({
        where: { ...dateRangeFilter, status: "FINALIZED" },
        _sum: {
          grandTotal: true,
          totalTax: true,
          totalDiscount: true,
        },
      }),
      prisma.document.findMany({
        where: { userId: session.user.id, status: "DRAFT" },
        orderBy: { createdAt: "desc" },
        take: 4,
        select: {
          id: true,
          title: true,
          customer: true,
          issueDate: true,
        },
      }),
      prisma.document.findMany({
        where: { userId: session.user.id, status: "FINALIZED" },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          customer: true,
          issueDate: true,
          grandTotal: true,
        },
      }),
    ]);

    return NextResponse.json({
      status: "success",
      message: "Document summary fetched",
      data: {
        counts: {
          total: totalCount,
          draft: draftCount,
          finalized: finalizedCount,
        },
        totals: {
          grandTotal: decimalToString(aggregation._sum.grandTotal),
          totalTax: decimalToString(aggregation._sum.totalTax),
          totalDiscount: decimalToString(aggregation._sum.totalDiscount),
        },
        recentDraftDocuments: recentDraftDocuments.map((doc) => ({
          ...doc,
          issueDate: doc.issueDate.toISOString(),
        })),
        recentFinalizedDocuments: recentFinalizedDocuments.map((doc) => ({
          ...doc,
          issueDate: doc.issueDate.toISOString(),
          grandTotal: decimalToString(doc.grandTotal),
        })),
      },
    });
  } catch (error) {
    console.error(error);

    const details = getErrorDetails({
      error,
      forEntity: "Document summary",
    });

    return NextResponse.json(
      { status: "error", message: details.message },
      { status: details.statusCode },
    );
  }
};
