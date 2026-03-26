import { AppLink } from '../../shared/routing/AppLink';
import { routePaths } from '../../shared/routing/paths';

interface SettingsTabsProps {
  active: 'account' | 'security' | 'telegram';
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
      <AppLink
        className={
          active === 'telegram'
            ? 'section-tab section-tab-active'
            : 'section-tab'
        }
        to={routePaths.settingsTelegram}
      >
        Telegram
      </AppLink>
    </nav>
  );
}
