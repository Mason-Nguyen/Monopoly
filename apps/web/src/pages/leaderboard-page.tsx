import { Link } from "react-router-dom";
import { formatCompactNumber, formatDateTime } from "../lib";
import { useLeaderboardQuery } from "../services";

export function LeaderboardPage() {
  const leaderboardQuery = useLeaderboardQuery({
    limit: 12,
    offset: 0
  });

  const entries = leaderboardQuery.data?.entries ?? [];

  return (
    <div className="page-stack">
      <section className="hero-panel hero-panel--compact">
        <div className="hero-panel__copy">
          <p className="eyebrow">Durable standings</p>
          <h1>Leaderboard is now wired to the real API.</h1>
          <p className="lead">
            This route is no longer a placeholder. It reads the durable standings from the Fastify
            API and keeps the live room noise out of the competitive overview.
          </p>
          <div className="cta-row cta-row--stacked-mobile">
            <Link className="button button--primary" to="/play">
              Back to Menu
            </Link>
            <button
              className="button button--secondary"
              onClick={() => {
                void leaderboardQuery.refetch();
              }}
              type="button"
            >
              {leaderboardQuery.isFetching ? "Refreshing..." : "Refresh Standings"}
            </button>
          </div>
        </div>
      </section>

      {leaderboardQuery.isLoading ? (
        <section className="surface-card surface-card--soft">
          <p className="eyebrow">Loading standings</p>
          <h2>Pulling the current table leaders from the API.</h2>
        </section>
      ) : leaderboardQuery.isError ? (
        <section className="surface-card surface-card--danger">
          <p className="eyebrow">Leaderboard unavailable</p>
          <h2>The standings could not be loaded right now.</h2>
          <p>{leaderboardQuery.error instanceof Error ? leaderboardQuery.error.message : "Unexpected API failure."}</p>
        </section>
      ) : entries.length === 0 ? (
        <section className="surface-card surface-card--soft">
          <p className="eyebrow">No data yet</p>
          <h2>Leaderboard will appear here once matches keep finishing.</h2>
        </section>
      ) : (
        <section className="surface-card data-surface">
          <div className="section-heading section-heading--inline">
            <div>
              <p className="eyebrow">Top seats</p>
              <h2>{entries.length} players loaded from durable stats</h2>
            </div>
            <span className="meta-note">Ranks are calculated by API order, not client-side guesswork.</span>
          </div>

          <div className="record-list">
            {entries.map((entry) => (
              <article key={entry.userId} className="record-row record-row--leaderboard">
                <div className="record-row__leading">
                  <span className="rank-pill">#{entry.rank}</span>
                  <div>
                    <h3>{entry.displayName}</h3>
                    <p>Updated {formatDateTime(entry.updatedAt)}</p>
                  </div>
                </div>

                <div className="record-row__stats">
                  <span>
                    <strong>{formatCompactNumber(entry.wins)}</strong>
                    wins
                  </span>
                  <span>
                    <strong>{formatCompactNumber(entry.losses)}</strong>
                    losses
                  </span>
                  <span>
                    <strong>{formatCompactNumber(entry.matchesPlayed)}</strong>
                    matches
                  </span>
                  <span>
                    <strong>{formatCompactNumber(entry.bankruptcies)}</strong>
                    bankruptcies
                  </span>
                  <span>
                    <strong>{formatCompactNumber(entry.abandons)}</strong>
                    abandons
                  </span>
                </div>

                <div className="record-row__meta">
                  <span className="status-chip status-chip--ghost">
                    {entry.lastMatchAt ? `Last match ${formatDateTime(entry.lastMatchAt)}` : "No recorded finish yet"}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}