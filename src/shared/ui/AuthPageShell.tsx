import type { ReactNode } from 'react';

interface AuthPageShellProps {
  children?: ReactNode;
  footer?: ReactNode;
  subtitle?: string;
  title: string;
}

export function AuthPageShell({
  children,
  footer,
  subtitle,
  title,
}: AuthPageShellProps) {
  return (
    <section className="auth-page">
      <article className="auth-card">
        <header className="auth-intro">
          <h1>{title}</h1>
          {subtitle ? <p>{subtitle}</p> : null}
        </header>

        {children ? <div className="stack">{children}</div> : null}

        {footer ? <footer className="auth-footer">{footer}</footer> : null}
      </article>
    </section>
  );
}
