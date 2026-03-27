import { useId, type ReactNode } from 'react';

interface AuthPageShellProps {
  children?: ReactNode;
  footer?: ReactNode;
  subtitle?: string;
  utility?: ReactNode;
  title: string;
}

export function AuthPageShell({
  children,
  footer,
  subtitle,
  utility,
  title,
}: AuthPageShellProps) {
  const titleId = useId();
  const subtitleId = useId();
  const hasContent = Boolean(children);

  return (
    <section className="auth-page">
      <article className="auth-card">
        <div className={hasContent ? 'auth-layout' : 'auth-layout auth-layout-solo'}>
          <section
            aria-describedby={subtitle ? subtitleId : undefined}
            aria-labelledby={titleId}
            className="auth-intro"
          >
            <div className="auth-intro-copy">
              <h1 id={titleId}>{title}</h1>
              {subtitle ? <p id={subtitleId}>{subtitle}</p> : null}
            </div>

            {utility ? (
              <aside
                aria-label={`${title} support`}
                aria-live="polite"
                className="auth-support"
              >
                {utility}
              </aside>
            ) : null}
          </section>
          {hasContent ? (
            <section aria-label="Authentication content" className="auth-content stack">
              {children}
            </section>
          ) : null}
        </div>

        {footer ? <footer className="auth-footer">{footer}</footer> : null}
      </article>
    </section>
  );
}
