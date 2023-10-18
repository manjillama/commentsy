import styles from "./Spinner.module.css";

export const Spinner = ({
  size,
  color,
}: {
  size?: "sm";
  color?: "light" | "dark";
}) => (
  <div
    style={{ transform: size === "sm" ? "scale(0.2)" : "scale(0.3)" }}
    className={`${styles.ldsSpinner} ${
      color === "dark" ? styles.ldsSpinnerDark : styles.ldsSpinnerLight
    }`}
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
