import { PasskeySection } from '../../features/passkeys/components/PasskeySection';

export function SecuritySettingsPage() {
  return (
    <section className="auth-layout">
      <article className="form-card stack">
        <p className="eyebrow">Settings</p>
        <h1>Security settings</h1>
        <p className="section-copy">
          Manage sign-in methods that protect your account and make access easier on trusted devices.
        </p>

        <PasskeySection />
      </article>
    </section>
  );
}
