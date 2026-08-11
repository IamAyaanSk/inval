import axios, { isAxiosError, type AxiosRequestConfig } from "axios";

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
    if (
      isAxiosError<{ message?: string; error?: string; code?: string }>(
        error,
      ) &&
      error.response
    ) {
      const { statusText, data: payload } = error.response;

      throw new Error(
        payload?.message ??
          payload?.error ??
          (statusText || "Something went wrong"),
      );
    }

    throw error;
  }
}
