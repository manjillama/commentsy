import { CommentStyles } from "@/interfaces/IApp";

// Keep the original widget palettes as the defaults for every app.
export const DEFAULT_COMMENT_STYLES: CommentStyles = {
  light: {
    primary: { borderColor: "#d4d4d4", backgroundColor: "#fff", color: "#000" },
    accent: { backgroundColor: "#000", color: "#fff" },
  },
  dark: {
    primary: { borderColor: "#d4d4d4", backgroundColor: "#000", color: "#fff" },
    accent: { backgroundColor: "#fff", color: "#000" },
  },
};

export function isCommentStyles(value: unknown): value is CommentStyles {
  if (!value || typeof value !== "object") return false;
  return ["light", "dark"].every((theme) => {
    const borderColor = (value as any)[theme]?.primary?.borderColor;
    if (borderColor !== undefined &&
        (typeof borderColor !== "string" || !/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(borderColor))) return false;
    return ["primary", "accent"].every((role) =>
      ["backgroundColor", "color"].every((property) => {
        const color = (value as any)[theme]?.[role]?.[property];
        return typeof color === "string" && /^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(color);
      })
    );
  });
}

export function parseCommentStyles(value?: string): CommentStyles {
  try {
    const parsed: unknown = JSON.parse(value ?? "");
    if (isCommentStyles(parsed)) return {
      light: { ...parsed.light, primary: { ...parsed.light.primary, borderColor: parsed.light.primary.borderColor ?? "#d4d4d4" } },
      dark: { ...parsed.dark, primary: { ...parsed.dark.primary, borderColor: parsed.dark.primary.borderColor ?? "#d4d4d4" } },
    };
  } catch {
    // Older apps with missing or invalid palettes keep the original appearance.
  }
  return DEFAULT_COMMENT_STYLES;
}
