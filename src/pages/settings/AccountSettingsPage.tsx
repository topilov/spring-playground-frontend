import { AccountSettingsSection } from '../../features/profile/components/AccountSettingsSection';
import { PageHeader } from '../../shared/ui/PageHeader';

export function AccountSettingsPage() {
  return (
    <section className="page-grid">
      <PageHeader
        description="Editable sign-in identity and the email verification flow for this account."
        eyebrow="Editing"
        title="Account"
      />

      <AccountSettingsSection />
    </section>
  );
}
