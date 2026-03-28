import { PasswordChangeSection } from '../../features/profile/components/PasswordChangeSection';
import { PasskeySection } from '../../features/passkeys/components/PasskeySection';
import { TwoFactorSection } from '../../features/two-factor/components/TwoFactorSection';
import { PageHeader } from '../../shared/ui/PageHeader';

export function SecuritySettingsPage() {
  return (
    <section className="page-grid">
      <PageHeader
        description="Passwords, verification methods, and device trust for the current account."
        eyebrow="Access"
        title="Security"
      />

      <section className="workspace-column stack">
        <PasswordChangeSection />
        <TwoFactorSection />
        <PasskeySection />
      </section>
    </section>
  );
}
