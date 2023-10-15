import Link, { LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { CSSProperties } from "react";
export const NavLink = ({
  href,
  children,
  className,
  activeStyle,
  ...props
}: LinkProps & {
  children?: React.ReactNode;
  className?: string;
  activeStyle: CSSProperties;
}) => {
  const currentRoute = usePathname();

  return (
    <Link
      href={href}
      {...props}
      style={currentRoute === href ? activeStyle : {}}
      className={className}
    >
      {children}
    </Link>
  );
};
