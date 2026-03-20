import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface AppLinkProps {
  children: ReactNode;
  className?: string;
  to: string;
}

export function AppLink({ children, className, to }: AppLinkProps) {
  return (
    <Link className={className} to={to}>
      {children}
    </Link>
  );
}
