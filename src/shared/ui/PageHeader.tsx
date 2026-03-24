import { useId, type ReactNode } from 'react';

interface PageHeaderProps {
  actions?: ReactNode;
  description?: string;
  eyebrow?: string;
  title: string;
}

export function PageHeader({
  actions,
  description,
  eyebrow,
  title,
}: PageHeaderProps) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <header
      aria-describedby={description ? descriptionId : undefined}
      aria-labelledby={titleId}
      className="page-header"
    >
      <div className="page-header-copy">
        {eyebrow ? <p className="page-eyebrow">{eyebrow}</p> : null}
        <h1 id={titleId}>{title}</h1>
        {description ? (
          <p className="page-description" id={descriptionId}>
            {description}
          </p>
        ) : null}
      </div>

      {actions ? <div className="page-header-actions">{actions}</div> : null}
    </header>
  );
}
