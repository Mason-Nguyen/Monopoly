import { Link } from "react-router-dom";

interface PlaceholderPageProps {
  eyebrow: string;
  title: string;
  summary: string;
  primaryLabel: string;
  primaryTo: string;
  secondaryLabel?: string;
  secondaryTo?: string;
  highlights?: string[];
}

export function PlaceholderPage({
  eyebrow,
  title,
  summary,
  primaryLabel,
  primaryTo,
  secondaryLabel,
  secondaryTo,
  highlights = []
}: PlaceholderPageProps) {
  return (
    <div className="route-preview">
      <section className="hero-panel hero-panel--compact route-preview__hero">
        <div className="hero-panel__copy">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="lead">{summary}</p>
          <div className="cta-row cta-row--stacked-mobile">
            <Link className="button button--primary" to={primaryTo}>
              {primaryLabel}
            </Link>
            {secondaryLabel && secondaryTo ? (
              <Link className="button button--ghost" to={secondaryTo}>
                {secondaryLabel}
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      {highlights.length > 0 ? (
        <section className="info-grid">
          {highlights.map((item, index) => (
            <article key={item} className="info-card">
              <span className="info-card__index">0{index + 1}</span>
              <h3>{item}</h3>
              <p>This route is now wired into the real frontend shell and ready for deeper implementation.</p>
            </article>
          ))}
        </section>
      ) : null}
    </div>
  );
}