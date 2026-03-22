import { AppLink } from '../../shared/routing/AppLink';
import { routePaths } from '../../shared/routing/paths';
import { AuthPageShell } from '../../shared/ui/AuthPageShell';

export function NotFoundPage() {
  return (
    <AuthPageShell
      subtitle="The page you requested could not be found."
      title="Page not found"
    >
      <AppLink className="button button-primary button-full" to={routePaths.home}>
        Back to app
      </AppLink>
    </AuthPageShell>
  );
}
