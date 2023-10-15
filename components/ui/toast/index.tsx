import * as RadixToast from "@radix-ui/react-toast";
import styles from "./Toast.module.css";
import { Cross1Icon } from "@radix-ui/react-icons";

export default function Toast({
  message,
  onOpenChange,
}: {
  message: string;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <>
      <RadixToast.Root
        onOpenChange={(open) => setTimeout(() => onOpenChange(open), 200)}
        className={styles.toastRoot}
      >
        <RadixToast.Description className={styles.toastDescription}>
          {message}
        </RadixToast.Description>
        <RadixToast.Close>
          <Cross1Icon color="#fff" />
        </RadixToast.Close>
      </RadixToast.Root>
      <RadixToast.Viewport className={styles.toastViewport} />
    </>
  );
}
