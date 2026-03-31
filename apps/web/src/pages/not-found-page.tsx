import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="site-shell marketing-layout">
      <main className="marketing-main">
        <section className="hero-panel hero-panel--compact route-preview__hero">
          <div className="hero-panel__copy">
            <p className="eyebrow">Lost route</p>
            <h1>The table you asked for is not here.</h1>
            <p className="lead">
              This route does not exist yet. Use the menu hub or return to the landing page to keep
              the play session moving.
            </p>
            <div className="cta-row">
              <Link className="button button--primary" to="/play">
                Go to Menu Hub
              </Link>
              <Link className="button button--ghost" to="/">
                Return Home
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}