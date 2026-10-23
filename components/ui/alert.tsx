import React from "react";

export function Alert({
  variant,
  children,
}: {
  variant: "warn" | "error";
  children: React.ReactNode;
}) {
  let style = {
    warn: {
      backgroundColor: "#fcd34d",
      color: "#000000",
    },
    error: {
      backgroundColor: "#3c1618",
      color: "#ff6166",
    },
  };
  return (
    <div style={style[variant] ?? style.error} className="p-3 rounded-lg">
      {children}
    </div>
  );
}
