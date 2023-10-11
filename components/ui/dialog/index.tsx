"use client";
import React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import styles from "./Dialog.module.css";

export const Dialog = ({
  triggerText,
  children,
  open,
  openChange,
  triggerClass,
}: {
  triggerText: string;
  children: React.ReactNode;
  open: boolean;
  triggerClass?: string;
  openChange: (open: boolean) => void;
}) => (
  <RadixDialog.Root open={open} onOpenChange={openChange}>
    <RadixDialog.Trigger className={triggerClass ?? ""}>
      {triggerText}
    </RadixDialog.Trigger>
    <RadixDialog.Portal>
      <RadixDialog.Overlay className={styles.dialogOverlay}>
        <RadixDialog.Content className={styles.dialogContent}>
          {children}
        </RadixDialog.Content>
      </RadixDialog.Overlay>
    </RadixDialog.Portal>
  </RadixDialog.Root>
);
