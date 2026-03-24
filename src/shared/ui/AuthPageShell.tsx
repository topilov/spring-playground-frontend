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

  return (
    <section className="auth-page">
      <article className="auth-card">
        <div className="auth-header">
          <section
            aria-describedby={subtitle ? subtitleId : undefined}
            aria-labelledby={titleId}
            className="auth-intro"
          >
            <h1 id={titleId}>{title}</h1>
            {subtitle ? <p id={subtitleId}>{subtitle}</p> : null}
          </section>

          {utility ? <div className="auth-utility">{utility}</div> : null}
        </div>

        {children ? <div className="auth-content stack">{children}</div> : null}

        {footer ? <footer className="auth-footer">{footer}</footer> : null}
      </article>
    </section>
  );
}
