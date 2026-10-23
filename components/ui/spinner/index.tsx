import spinnerStyles from "./Spinner.module.css";

export const Spinner = ({
  size,
  color,
  styles = {},
}: {
  styles?: React.CSSProperties;
  size?: "sm";
  color?: "light" | "dark";
}) => (
  <div
    style={{
      ...{ transform: size === "sm" ? "scale(0.2)" : "scale(0.3)" },
    }}
    className={`${spinnerStyles.ldsSpinner} ${
      color
        ? color === "dark"
          ? spinnerStyles.ldsSpinnerDark
          : spinnerStyles.ldsSpinnerLight
        : {}
    }`}
  >
    <div style={styles}></div>
    <div style={styles}></div>
    <div style={styles}></div>
    <div style={styles}></div>
    <div style={styles}></div>
    <div style={styles}></div>
    <div style={styles}></div>
    <div style={styles}></div>
    <div style={styles}></div>
    <div style={styles}></div>
    <div style={styles}></div>
    <div style={styles}></div>
  </div>
);
