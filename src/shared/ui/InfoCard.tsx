interface InfoCardProps {
  title: string;
  description: string;
  value: string;
}

export function InfoCard({ title, description, value }: InfoCardProps) {
  return (
    <article className="info-card">
      <h2>{title}</h2>
      <p className="muted">{description}</p>
      <code className="info-value">{value}</code>
    </article>
  );
}
