"use client";
import React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import styles from "./Dialog.module.css";

export const Dialog = ({
  triggerNode,
  triggerClass,
  children,
  open,
  openChange,
  maxWidth,
}: {
  triggerNode: React.ReactNode;
  triggerClass?: string;
  children: React.ReactNode;
  open: boolean;
  maxWidth?: "md";
  openChange: (open: boolean) => void;
}) => (
  <RadixDialog.Root open={open} onOpenChange={openChange}>
    <RadixDialog.Trigger className={triggerClass ?? ""}>
      {triggerNode}
    </RadixDialog.Trigger>
    <RadixDialog.Portal>
      <RadixDialog.Overlay className={styles.dialogOverlay}>
        <RadixDialog.Content
          className={styles.dialogContent}
          style={maxWidth ? { maxWidth: 640 } : {}}
        >
          {children}
        </RadixDialog.Content>
      </RadixDialog.Overlay>
    </RadixDialog.Portal>
  </RadixDialog.Root>
);
