import { PasskeySection } from '../../features/passkeys/components/PasskeySection';
import { TwoFactorSection } from '../../features/two-factor/components/TwoFactorSection';
import { AppLink } from '../../shared/routing/AppLink';
import { routePaths } from '../../shared/routing/paths';
import { PageHeader } from '../../shared/ui/PageHeader';

export function SecuritySettingsPage() {
  return (
    <section className="page-grid">
      <PageHeader
        description="Manage sign-in methods and account access posture."
        eyebrow="Settings"
        status={
          <p className="status-banner" role="status">
            Passkey and two-factor changes apply to the current operator account immediately.
          </p>
        }
        title="Security"
      />

      <nav aria-label="Settings sections" className="section-tabs">
        <AppLink
          className="section-tab section-tab-active"
          to={routePaths.settingsSecurity}
        >
          Security
        </AppLink>
      </nav>

      <div className="workspace-shell workspace-shell-split">
        <section className="workspace-band workspace-band-primary stack">
          <TwoFactorSection />
          <PasskeySection />
        </section>

        <aside className="workspace-column stack">
          <section className="workspace-band workspace-band-secondary stack">
            <div className="section-heading">
              <h2>Recovery posture</h2>
              <p className="page-description">
                Keep at least one trusted second factor and a recovery path you can still reach
                under pressure.
              </p>
            </div>

            <dl className="detail-rows">
              <div className="detail-row">
                <dt>Authenticator app</dt>
                <dd>Use a device you control directly and keep time sync enabled.</dd>
              </div>
              <div className="detail-row">
                <dt>Backup codes</dt>
                <dd>Store them away from the primary device so one outage does not lock you out.</dd>
              </div>
              <div className="detail-row detail-row-wide">
                <dt>Before you remove anything</dt>
                <dd>
                  Confirm another sign-in method still works on a separate device before
                  deleting a passkey or disabling two-factor authentication.
                </dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </section>
  );
}
