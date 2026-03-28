import { NavLink } from 'react-router-dom';

import { routePaths } from '../../shared/routing/paths';

interface AuthenticatedSidebarProps {
  onLogout: () => Promise<void>;
  signingOut: boolean;
}

const navigationItems = [
  { icon: 'profile', label: 'Profile', to: routePaths.profile },
  { icon: 'account', label: 'Account', to: routePaths.settingsAccount },
  { icon: 'security', label: 'Security', to: routePaths.settingsSecurity },
  { icon: 'telegram', label: 'Telegram', to: routePaths.settingsTelegram },
] as const;

function getSidebarLinkClassName(isActive: boolean) {
  return isActive ? 'workspace-nav-link workspace-nav-link-active' : 'workspace-nav-link';
}

function SidebarIcon({ type }: { type: (typeof navigationItems)[number]['icon'] }) {
  if (type === 'profile') {
    return (
      <svg aria-hidden="true" className="workspace-nav-icon" viewBox="0 0 24 24">
        <path d="M20 21a8 8 0 0 0-16 0" />
        <circle cx="12" cy="8" r="5" />
      </svg>
    );
  }

  if (type === 'account') {
    return (
      <svg aria-hidden="true" className="workspace-nav-icon" viewBox="0 0 24 24">
        <path
          d="M15 2H9a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"
        />
        <path d="M11 17h2" />
        <path d="M12 13v.01" />
      </svg>
    );
  }

  if (type === 'security') {
    return (
      <svg aria-hidden="true" className="workspace-nav-icon" viewBox="0 0 24 24">
        <path
          d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"
        />
        <path d="M9.5 12.5 11 14l3.5-3.5" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="workspace-nav-icon" viewBox="0 0 24 24">
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

export function AuthenticatedSidebar({
  onLogout,
  signingOut,
}: AuthenticatedSidebarProps) {
  return (
    <aside className="workspace-sidebar">
      <nav aria-label="Workspace" className="workspace-nav">
        <p className="page-eyebrow">Workspace</p>

        <div className="workspace-nav-list">
          {navigationItems.map((item) => (
            <NavLink
              className={({ isActive }) => getSidebarLinkClassName(isActive)}
              key={item.to}
              to={item.to}
            >
              <SidebarIcon type={item.icon} />
              <span className="workspace-nav-label">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="workspace-sidebar-footer">
        <button
          className="button button-secondary button-full"
          disabled={signingOut}
          onClick={() => {
            void onLogout();
          }}
          type="button"
        >
          {signingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </aside>
  );
}
