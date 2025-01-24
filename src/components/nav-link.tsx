// social-network\src\components\nav-link.tsx

import Link from "next/link";
import { ReactNode } from "react";

interface NavLinkProps {
  href: string;
  icon: ReactNode;
  label: string;
  badge?: ReactNode;
}

function NavLink({ href, icon, label, badge }: NavLinkProps) {
  return (
    <Link
      href={href}
      className="group flex items-center space-x-4 p-3 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-primary hover:shadow-lg"
    >
      <div className="text-2xl text-accent group-hover:text-background transition-colors relative">
        {icon}
        {badge && <div className="absolute -top-2 -right-2">{badge}</div>}
      </div>
      <span className="text-sm font-medium text-foreground group-hover:text-background transition-colors">
        {label}
      </span>
    </Link>
  );
}

export default NavLink;