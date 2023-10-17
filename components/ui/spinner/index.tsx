import styles from "./Spinner.module.css";

export const Spinner = ({
  size,
  theme,
}: {
  size?: "sm";
  theme?: "light" | "dark";
}) => (
  <div
    style={{ transform: size === "sm" ? "scale(0.2)" : "scale(0.3)" }}
    className={`${styles.ldsSpinner} ${
      theme === "dark" ? styles.ldsSpinnerDark : styles.ldsSpinnerLight
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
