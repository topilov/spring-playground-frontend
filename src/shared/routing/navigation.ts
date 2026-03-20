import { useEffect, useState } from 'react';

const NAVIGATION_EVENT = 'app:navigate';

function normalizePath(path: string): string {
  const trimmed = path.trim();

  if (!trimmed) {
    return '/';
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

function emitNavigation(): void {
  window.dispatchEvent(new Event(NAVIGATION_EVENT));
}

export function navigateTo(path: string, options?: { replace?: boolean }): void {
  const nextPath = normalizePath(path);
  const currentPath = window.location.pathname;

  if (nextPath === currentPath) {
    emitNavigation();
    return;
  }

  if (options?.replace) {
    window.history.replaceState(null, '', nextPath);
  } else {
    window.history.pushState(null, '', nextPath);
  }

  emitNavigation();
}

export function useCurrentPath(): string {
  const [path, setPath] = useState(() => window.location.pathname || '/');

  useEffect(() => {
    const handleNavigation = () => {
      setPath(window.location.pathname || '/');
    };

    window.addEventListener('popstate', handleNavigation);
    window.addEventListener(NAVIGATION_EVENT, handleNavigation);

    return () => {
      window.removeEventListener('popstate', handleNavigation);
      window.removeEventListener(NAVIGATION_EVENT, handleNavigation);
    };
  }, []);

  return path;
}

export function getNavigationHref(path: string): string {
  return normalizePath(path);
}
