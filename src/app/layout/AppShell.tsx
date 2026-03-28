import type { ReactNode } from 'react';

import { AppLink } from '../../shared/routing/AppLink';
import { routePaths } from '../../shared/routing/paths';
import { AuthenticatedSidebar } from './AuthenticatedSidebar';

interface AppShellProps {
  children: ReactNode;
  logoutError: string;
  onLogout: () => Promise<void>;
  sessionContext?: string | null;
  signingOut: boolean;
}

export function AppShell({
  children,
  logoutError,
  onLogout,
  sessionContext,
  signingOut,
}: AppShellProps) {
  return (
    <div className="app-shell app-shell-workspace">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="app-header shell-header">
        <div className="shell-header-bar">
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

          <div className="header-actions shell-actions" aria-hidden="true" />
        </div>
      </header>

      <main className="app-main shell-main" id="main-content">
        <div className="shell-stage shell-stage-workspace">
          {logoutError ? (
            <p className="status-banner status-error" role="alert">
              {logoutError}
            </p>
          ) : null}

          <div className="workspace-shell workspace-shell-split">
            <AuthenticatedSidebar
              onLogout={onLogout}
              signingOut={signingOut}
            />
            <div aria-hidden="true" className="workspace-divider" />
            <div className="workspace-column workspace-content">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
