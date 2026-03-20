import { AppLink } from '../../shared/routing/AppLink';
import { routePaths } from '../../shared/routing/paths';

export function NotFoundPage() {
  return (
    <section className="auth-layout">
      <article className="form-card">
        <p className="eyebrow">Not Found</p>
        <h1>That page does not exist</h1>
        <p className="section-copy">
          The route you requested is outside the account workspace.
        </p>
        <AppLink className="primary-button link-button" to={routePaths.home}>
          Go home
        </AppLink>
      </article>
    </section>
  );
}
