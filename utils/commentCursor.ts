import AppError from "@/utils/appError";

export function commentCursor(comment: { createdAt: Date | string; _id: string }): string {
  return `${new Date(comment.createdAt).toISOString()}|${comment._id}`;
}

export function commentCursorFilter(cursor: unknown, ascending: boolean) {
  if (typeof cursor !== "string") throw new AppError("Invalid comment cursor", 400);
  const [timestamp, id, extra] = cursor.split("|");
  const date = new Date(timestamp);
  if (extra !== undefined || !Number.isFinite(date.getTime()) || date.toISOString() !== timestamp || !/^[a-f\d]{24}$/i.test(id ?? ""))
    throw new AppError("Invalid comment cursor", 400);
  const operator = ascending ? "$gt" : "$lt";
  return { $or: [
    { createdAt: { [operator]: date } },
    { createdAt: date, _id: { [operator]: id } },
  ] };
}
