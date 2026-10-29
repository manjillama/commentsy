import { AsyncLocalStorage } from "node:async_hooks";

type RequestLogContext = { requestId: string; method: string; path: string };
const storage = new AsyncLocalStorage<RequestLogContext>();

export function withRequestLogContext<T>(context: RequestLogContext, work: () => T): T {
  return storage.run(context, work);
}

export function requestLogContext(): Partial<RequestLogContext> {
  return storage.getStore() ?? {};
}

/** Preserve code locations for debugging without logging error messages/data. */
export function safeErrorDetails(error: any) {
  const locations = typeof error?.stack === "string" ? error.stack.split("\n").slice(1)
    .filter((line: string) => /^\s+at /.test(line))
    .map((line: string) => line.match(/(?:\(|\s)((?:\/|file:\/\/\/)[^()\s]+:\d+:\d+)\)?$/)?.[1])
    .filter(Boolean).slice(0, 8) : [];
  return {
    errorName: typeof error?.name === "string" && /^[A-Za-z][A-Za-z0-9]*$/.test(error.name) ? error.name : "UnknownError",
    ...(typeof error?.code === "number" ? { errorCode: error.code } : {}),
    ...(typeof error?.operation === "string" && /^comment\.[a-z_]+$/.test(error.operation) ? { operation: error.operation } : {}),
    ...(locations.length ? { locations } : {}),
  };
}
