import { AccountSettingsSection } from '../../features/profile/components/AccountSettingsSection';
import { AppLink } from '../../shared/routing/AppLink';
import { routePaths } from '../../shared/routing/paths';
import { PageHeader } from '../../shared/ui/PageHeader';

export function AccountSettingsPage() {
  return (
    <section className="page-grid">
      <PageHeader
        actions={
          <div className="inline-actions">
            <AppLink className="button button-secondary" to={routePaths.profile}>
              Profile
            </AppLink>
          </div>
        }
        description="Editable sign-in identity and the email verification flow for this account."
        eyebrow="Editing"
        status={
          <p className="status-banner" role="status">
            Username changes apply immediately. Email changes complete after verification from
            the new address.
          </p>
        }
        title="Account"
      />

      <div className="workspace-shell workspace-shell-split">
        <section className="workspace-column stack">
          <AccountSettingsSection />
        </section>

        <aside className="workspace-column stack">
          <section className="workspace-band workspace-band-secondary stack">
            <div className="section-heading">
              <h2>Change rules</h2>
              <p className="page-description">
                Username and email edits share one workspace but follow different backend flows.
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
