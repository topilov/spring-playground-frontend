import type { MouseEvent, ReactNode } from 'react';

import { getNavigationHref, navigateTo } from './navigation';

interface AppLinkProps {
  children: ReactNode;
  className?: string;
  to: string;
}

export function AppLink({ children, className, to }: AppLinkProps) {
  const href = getNavigationHref(to);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return;
    }

    event.preventDefault();
    navigateTo(href);
  };

  return (
    <a className={className} href={href} onClick={handleClick}>
      {children}
    </a>
  );
}
