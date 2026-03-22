import { PasskeySection } from '../../features/passkeys/components/PasskeySection';
import { AppLink } from '../../shared/routing/AppLink';
import { routePaths } from '../../shared/routing/paths';
import { PageHeader } from '../../shared/ui/PageHeader';

export function SecuritySettingsPage() {
  return (
    <section className="page-grid">
      <PageHeader
        description="Manage sign-in methods."
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

      <article className="page-card stack">
        <PasskeySection />
      </article>
    </section>
  );
}
