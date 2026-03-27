import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

import { AppLink } from '../../shared/routing/AppLink';
import { routePaths } from '../../shared/routing/paths';

interface PublicShellProps {
  children: ReactNode;
  sessionContext?: string | null;
  showAnonymousActions: boolean;
}

function getHeaderLinkClassName(isActive: boolean) {
  return isActive ? 'header-link header-link-active' : 'header-link';
}

export function PublicShell({
  children,
  sessionContext,
  showAnonymousActions,
}: PublicShellProps) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <AppLink className="brand" to={routePaths.home}>
          <span aria-hidden="true" className="brand-mark">
            SP
          </span>
          <span className="brand-name">Spring Playground</span>
        </AppLink>

        {sessionContext ? (
          <p
            aria-label="Session context"
            className="header-meta"
            role="status"
            title={sessionContext}
          >
            {sessionContext}
          </p>
        ) : (
          <div className="header-meta-spacer" aria-hidden="true" />
        )}

        <div className="header-actions">
          <nav aria-label="Primary" className="inline-actions">
            {showAnonymousActions ? (
              <NavLink
                className={({ isActive }) => getHeaderLinkClassName(isActive)}
                to={routePaths.login}
              >
                Sign in
              </NavLink>
            ) : null}
          </nav>

          <nav aria-label="Utility" className="inline-actions">
            {showAnonymousActions ? (
              <NavLink
                className={({ isActive }) => getHeaderLinkClassName(isActive)}
                to={routePaths.register}
              >
                Create account
              </NavLink>
            ) : null}
          </nav>
        </div>
      </header>

      <main className="app-main">{children}</main>
    </div>
  );
}
