import { AppLink } from '../../shared/routing/AppLink';
import { routePaths } from '../../shared/routing/paths';
import { AuthPageShell } from '../../shared/ui/AuthPageShell';

export function NotFoundPage() {
  return (
    <AuthPageShell
      subtitle="This route is outside the current workspace."
      utility={
        <p className="status-banner">
          Return to the public entry and continue from a known sign-in or account path.
        </p>
      }
      title="Page not found"
    >
      <AppLink className="button button-primary button-full" to={routePaths.home}>
        Back to entry
      </AppLink>
    </AuthPageShell>
  );
}
