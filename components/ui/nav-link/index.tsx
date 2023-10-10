import Link, { LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import styles from "./NavLink.module.css";
export const NavLink = ({
  href,
  children,
  className,
  ...props
}: LinkProps & { children?: React.ReactNode; className?: string }) => {
  const currentRoute = usePathname();

  return (
    <Link
      href={href}
      {...props}
      className={
        currentRoute === href
          ? `${styles.active} ${className ?? ""}`
          : className ?? ""
      }
    >
      {children}
    </Link>
  );
};
