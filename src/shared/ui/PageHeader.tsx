import type { ReactNode } from 'react';

interface PageHeaderProps {
  actions?: ReactNode;
  description?: string;
  eyebrow?: string;
  status?: ReactNode;
  title: string;
}

export function PageHeader({
  actions,
  description,
  eyebrow,
  status,
  title,
}: PageHeaderProps) {
  const hasAside = Boolean(actions || status);

  return (
    <header className="page-header">
      <div className="page-header-copy">
        {eyebrow ? <p className="page-eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {description ? <p className="page-description">{description}</p> : null}
      </div>

      {hasAside ? (
        <div className="page-header-aside stack">
          {status ? <div className="page-header-status">{status}</div> : null}
          {actions ? <div className="page-header-actions">{actions}</div> : null}
        </div>
      ) : null}
    </header>
  );
}
