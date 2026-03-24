import { PasskeySection } from '../../features/passkeys/components/PasskeySection';
import { AppLink } from '../../shared/routing/AppLink';
import { routePaths } from '../../shared/routing/paths';
import { PageHeader } from '../../shared/ui/PageHeader';

export function SecuritySettingsPage() {
  return (
    <section className="page-grid">
      <PageHeader
        description="Manage sign-in methods and account access posture."
        eyebrow="Settings"
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
          <PasskeySection />
        </section>

        <aside className="workspace-column stack">
          <section className="workspace-band workspace-band-secondary stack">
            <div className="section-heading">
              <h2>Passkey posture</h2>
              <p className="page-description">
                Keep at least one passkey on a device you control so account recovery stays
                simple.
              </p>
            </div>

            <dl className="detail-rows">
              <div className="detail-row">
                <dt>Preferred use</dt>
                <dd>Trusted personal or work devices you use regularly.</dd>
              </div>
              <div className="detail-row">
                <dt>Operator habit</dt>
                <dd>Name each passkey clearly so you can retire older devices quickly.</dd>
              </div>
              <div className="detail-row detail-row-wide">
                <dt>Before you remove one</dt>
                <dd>
                  Confirm another sign-in method is available on a separate device before
                  deleting the current key.
                </dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </section>
  );
}
