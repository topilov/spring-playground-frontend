import { RegisterForm } from '../../features/auth/components/RegisterForm';
import { AuthPageShell } from '../../shared/ui/AuthPageShell';

export function RegisterPage() {
  return (
    <AuthPageShell
      subtitle="Create the account you will use for profile access, sign-in checks, and recovery."
      utility={
        <p className="status-banner" role="status">
          Use an address you can verify now. Sign-in stays paused until email verification is
          complete.
        </p>
      }
      title="Create account"
    >
      <RegisterForm />
    </AuthPageShell>
  );
}
