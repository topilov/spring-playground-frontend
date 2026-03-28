import { TelegramSettingsSection } from '../../features/telegram/components/TelegramSettingsSection';
import { PageHeader } from '../../shared/ui/PageHeader';

export function TelegramSettingsPage() {
  return (
    <section className="page-grid">
      <PageHeader
        description="Telegram connection flow, focus sync, and automation access for this account."
        eyebrow="Integration"
        title="Telegram"
      />

      <section className="workspace-column stack">
        <TelegramSettingsSection />
      </section>
    </section>
  );
}
