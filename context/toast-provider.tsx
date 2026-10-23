"use client";
import * as Toast from "@radix-ui/react-toast";

export default function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Toast.Provider duration={5000}>{children}</Toast.Provider>;
}
