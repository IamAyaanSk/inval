import { NextResponse } from "next/server";
import { type ApiResponseBase } from "@/lib/validations/shared";

type DefaultType = { __default?: true };

// This is a custom type I created to easily type the returned response from route handlers
export type RouteHandlerReturnType<T = DefaultType> = Promise<
  NextResponse<
    T extends DefaultType
      ? ApiResponseBase
      : T | { status: "error"; message: string }
  >
>;
