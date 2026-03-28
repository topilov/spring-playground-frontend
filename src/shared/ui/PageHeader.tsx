import { useId, type ReactNode } from 'react';

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
  const titleId = useId();
  const descriptionId = useId();
  const hasAside = Boolean(actions || status);
  const describedBy = description ? descriptionId : undefined;

  return (
    <header
      aria-describedby={describedBy}
      aria-labelledby={titleId}
      className="page-header"
    >
      <div className="page-header-copy">
        {eyebrow ? <p className="page-eyebrow">{eyebrow}</p> : null}
        <h1 id={titleId}>{title}</h1>
        {description ? <p className="page-description" id={descriptionId}>{description}</p> : null}
      </div>

      {hasAside ? (
        <div className="page-header-aside stack">
          {status ? (
            <div aria-label={`${title} status`} className="page-header-status" role="group">
              {status}
            </div>
          ) : null}
          {actions ? (
            <div aria-label={`${title} actions`} className="page-header-actions" role="group">
              {actions}
            </div>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
