import { TelegramSettingsSection } from '../../features/telegram/components/TelegramSettingsSection';
import { PageHeader } from '../../shared/ui/PageHeader';
import { SettingsTabs } from './SettingsTabs';

export function TelegramSettingsPage() {
  return (
    <section className="page-grid">
      <PageHeader
        description="Manage Telegram connection, focus sync settings, and automation access."
        eyebrow="Settings"
        status={
          <p className="status-banner" role="status">
            Telegram sync stays aligned with backend connection and focus state.
          </p>
        }
        title="Telegram"
      />

      <SettingsTabs active="telegram" />

      <div className="workspace-shell workspace-shell-split">
        <section className="stack">
          <TelegramSettingsSection />
        </section>

        <aside className="workspace-column stack">
          <section className="workspace-band workspace-band-secondary stack">
            <div className="section-heading">
              <h2>Integration notes</h2>
              <p className="page-description">
                Keep Telegram connected, rotate tokens when access changes, and use the raw
                token only in the shortcut client that owns the automation.
              </p>
            </div>
            <dl className="detail-rows">
              <div className="detail-row detail-row-wide">
                <dt>Connect flow</dt>
                <dd>Phone, code, and password steps stay aligned with backend state.</dd>
              </div>
              <div className="detail-row detail-row-wide">
                <dt>Token handling</dt>
                <dd>Raw tokens are shown once after creation or regeneration.</dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </section>
  );
}
