export type ApiResponse<T> = (
  | { status: "success"; data: T }
  | { status: "fail" | "error"; message: string; errors: string[] }
) & { requestId?: string };

type RequestOptions = Pick<RequestInit, "signal">;
const fallbackMessage = "Unable to complete the request. Please try again.";

// Keep all methods consistent, including proxy errors that return HTML instead of JSON.
async function request<T>(url: string, method: string, data?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
  let requestId: string | undefined;
  try {
    const response = await fetch(url, {
      ...options,
      method,
      headers: {
        Accept: "application/json",
        ...(data !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
    });
    requestId = response.headers.get("X-Request-ID") ?? undefined;
    if (response.ok && response.status === 204)
      return { status: "success", data: undefined as T, requestId };

    const body = await response.json();
    if (response.ok && body?.status === "success" && "data" in body)
      return { status: "success", data: body.data as T, requestId };

    const message = typeof body?.message === "string" && body.message.trim() ? body.message : fallbackMessage;
    const errors = Array.isArray(body?.errors)
      ? body.errors.filter((error: unknown): error is string => typeof error === "string" && Boolean(error.trim()))
      : [];
    return {
      status: body?.status === "fail" || (response.status >= 400 && response.status < 500) ? "fail" : "error",
      message,
      errors: errors.length ? errors : [message],
      requestId,
    };
  } catch {
    return { status: "error", message: fallbackMessage, errors: [fallbackMessage], requestId };
  }
}

const api = {
  get<T>(url: string, options?: RequestOptions) { return request<T>(url, "GET", undefined, options); },
  post<T>(url: string, data: unknown, options?: RequestOptions) { return request<T>(url, "POST", data, options); },
  patch<T>(url: string, data: unknown, options?: RequestOptions) { return request<T>(url, "PATCH", data, options); },
  delete<T>(url: string, options?: RequestOptions) { return request<T>(url, "DELETE", undefined, options); },
};

export default api;
