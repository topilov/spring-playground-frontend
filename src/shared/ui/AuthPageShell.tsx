import type { ReactNode } from 'react';

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
  return (
    <section className="auth-page">
      <article className="auth-card">
        <div className="auth-header">
          <header className="auth-intro">
            <h1>{title}</h1>
            {subtitle ? <p>{subtitle}</p> : null}
          </header>

          {utility ? <div className="auth-utility">{utility}</div> : null}
        </div>

        {children ? <div className="stack">{children}</div> : null}

        {footer ? <footer className="auth-footer">{footer}</footer> : null}
      </article>
    </section>
  );
}
