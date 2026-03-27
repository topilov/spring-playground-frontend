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

          <div className="header-actions shell-actions">
            <nav aria-label="Utility" className="inline-actions shell-nav">
              <button
                className="button button-secondary"
                disabled={signingOut}
                onClick={() => {
                  void onLogout();
                }}
                type="button"
              >
                {signingOut ? 'Signing out...' : 'Sign out'}
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="app-main shell-main">
        <div className="shell-stage shell-stage-workspace">
          {logoutError ? (
            <p className="status-banner status-error" role="alert">
              {logoutError}
            </p>
          ) : null}

          <div className="workspace-shell workspace-shell-split">
            <AuthenticatedSidebar />
            <div className="workspace-column">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
