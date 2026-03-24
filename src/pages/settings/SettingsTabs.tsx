import { AppLink } from '../../shared/routing/AppLink';
import { routePaths } from '../../shared/routing/paths';

interface SettingsTabsProps {
  active: 'account' | 'security';
}

export function SettingsTabs({ active }: SettingsTabsProps) {
  return (
    <nav aria-label="Settings sections" className="section-tabs">
      <AppLink
        className={
          active === 'account'
            ? 'section-tab section-tab-active'
            : 'section-tab'
        }
        to={routePaths.settingsAccount}
      >
        Account
      </AppLink>
      <AppLink
        className={
          active === 'security'
            ? 'section-tab section-tab-active'
            : 'section-tab'
        }
        to={routePaths.settingsSecurity}
      >
        Security
      </AppLink>
    </nav>
  );
}
