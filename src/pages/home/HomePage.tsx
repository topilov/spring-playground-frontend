import { appConfig } from '../../shared/config/appConfig';
import { InfoCard } from '../../shared/ui/InfoCard';

const endpointNotes = [
  'GET /api/public/ping for unauthenticated reachability checks.',
  'POST /api/auth/login to establish the JSESSIONID-backed session.',
  'POST /api/auth/logout to invalidate the current session.',
  'GET /api/profile/me and PUT /api/profile/me for authenticated profile flows.',
];

const exampleSnippet = `import { ping } from '../../features/public/api';
import { login } from '../../features/auth/api';
import { getCurrentProfile } from '../../features/profile/api';

const pingResult = await ping();
const session = await login({
  usernameOrEmail: 'demo',
  password: 'demo-password',
});
const profile = await getCurrentProfile();`;

export function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">Spring Playground Frontend</p>
        <h1>Frontend is running</h1>
        <p className="hero-copy">
          This baseline stays lightweight on purpose: generated OpenAPI types,
          handwritten transport, and small feature modules ready for future auth
          and profile UI work.
        </p>
      </section>

      <section className="card-grid">
        <InfoCard
          title="API base URL"
          description="Runtime origin for local and deployed frontend calls."
          value={appConfig.apiBaseUrl}
        />
        <InfoCard
          title="Schema URL"
          description="Preferred backend contract source for type generation."
          value={appConfig.apiSchemaUrl}
        />
        <InfoCard
          title="Transport strategy"
          description="Types come from OpenAPI, but fetch logic stays explicit."
          value="Handwritten request<T>() with credentials: 'include'"
        />
      </section>

      <section className="section">
        <h2 className="section-title">Known backend endpoints</h2>
        <ul className="endpoint-list">
          {endpointNotes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="section">
        <h2 className="section-title">Example usage</h2>
        <article className="example-card">
          <h2>Feature APIs wrap the handwritten client</h2>
          <p className="muted">
            These examples use real endpoints from the backend OpenAPI contract.
          </p>
          <pre>
            <code>{exampleSnippet}</code>
          </pre>
        </article>
      </section>
    </main>
  );
}
