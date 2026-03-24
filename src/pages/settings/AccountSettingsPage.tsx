import { AccountSettingsSection } from '../../features/profile/components/AccountSettingsSection';
import { PageHeader } from '../../shared/ui/PageHeader';
import { SettingsTabs } from './SettingsTabs';

export function AccountSettingsPage() {
  return (
    <section className="page-grid">
      <PageHeader
        description="Manage primary account identity and the email address used for operator access."
        eyebrow="Settings"
        status={
          <p className="status-banner" role="status">
            Username changes apply immediately. Email changes complete after verification from
            the new address.
          </p>
        }
        title="Account"
      />

      <SettingsTabs active="account" />

      <div className="workspace-shell workspace-shell-split">
        <section className="stack">
          <AccountSettingsSection />
        </section>

        <aside className="workspace-column stack">
          <section className="workspace-band workspace-band-secondary stack">
            <div className="section-heading">
              <h2>Account change notes</h2>
              <p className="page-description">
                Username and email updates follow separate backend flows.
              </p>
            </div>

            <dl className="detail-rows">
              <div className="detail-row detail-row-wide">
                <dt>Username</dt>
                <dd>
                  The new username is saved immediately and becomes available on the current
                  session after refresh.
                </dd>
              </div>
              <div className="detail-row detail-row-wide">
                <dt>Email</dt>
                <dd>
                  The backend sends a one-time verification link to the new email before the
                  profile is updated.
                </dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </section>
  );
}
