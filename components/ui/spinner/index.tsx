import styles from "./Spinner.module.css";

export const Spinner = ({ size }: { size?: "sm" }) => (
  <div
    style={{ transform: size === "sm" ? "scale(0.2)" : "scale(0.3)" }}
    className={styles.ldsSpinner}
  >
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
);
