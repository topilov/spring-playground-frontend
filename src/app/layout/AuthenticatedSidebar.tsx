import { NavLink } from 'react-router-dom';

import { routePaths } from '../../shared/routing/paths';

function getSidebarLinkClassName(isActive: boolean) {
  return isActive ? 'header-link header-link-active' : 'header-link';
}

export function AuthenticatedSidebar() {
  return (
    <aside className="workspace-column">
      <nav aria-label="Workspace" className="workspace-shell">
        <NavLink
          className={({ isActive }) => getSidebarLinkClassName(isActive)}
          to={routePaths.profile}
        >
          Profile
        </NavLink>
        <NavLink
          className={({ isActive }) => getSidebarLinkClassName(isActive)}
          to={routePaths.settingsAccount}
        >
          Account
        </NavLink>
        <NavLink
          className={({ isActive }) => getSidebarLinkClassName(isActive)}
          to={routePaths.settingsSecurity}
        >
          Security
        </NavLink>
        <NavLink
          className={({ isActive }) => getSidebarLinkClassName(isActive)}
          to={routePaths.settingsTelegram}
        >
          Telegram
        </NavLink>
      </nav>
    </aside>
  );
}
