import axios, { isAxiosError, type AxiosRequestConfig } from "axios";
import { ApiError } from "./errors";

type ApiFetchOptions = Omit<AxiosRequestConfig, "url" | "data"> & {
  body?: unknown;
};

export async function apiFetch<T>(
  input: string,
  { body, headers, ...init }: ApiFetchOptions = {},
): Promise<T> {
  try {
    const response = await axios.request<T>({
      url: input,
      data: body,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      ...init,
    });

    if (response.status === 204) {
      return undefined as T;
    }

    return response.data;
  } catch (error: unknown) {
    if (isAxiosError<{ error?: string; code?: string }>(error) && error.response) {
      const { status, statusText, data: payload } = error.response;

      throw new ApiError(
        payload?.error ?? (statusText || "Request failed"),
        status,
        payload?.code,
      );
    }

    throw error;
  }
}
