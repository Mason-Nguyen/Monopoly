import { Link } from "react-router-dom";
import { formatDateTime, formatEnumLabel } from "../lib";
import { useMatchesQuery } from "../services";

export function MatchesPage() {
  const matchesQuery = useMatchesQuery({
    limit: 10,
    offset: 0
  });

  const matches = matchesQuery.data?.matches ?? [];

  return (
    <div className="page-stack">
      <section className="hero-panel hero-panel--compact">
        <div className="hero-panel__copy">
          <p className="eyebrow">Durable history</p>
          <h1>Finished matches now load from PostgreSQL-backed APIs.</h1>
          <p className="lead">
            This route is the durable trail of completed sessions. It is separate from the live room
            shell and ready to become the fallback path once reconnect lands after a match finishes.
          </p>
          <div className="cta-row cta-row--stacked-mobile">
            <Link className="button button--primary" to="/play">
              Back to Menu
            </Link>
            <button
              className="button button--secondary"
              onClick={() => {
                void matchesQuery.refetch();
              }}
              type="button"
            >
              {matchesQuery.isFetching ? "Refreshing..." : "Refresh Matches"}
            </button>
          </div>
        </div>
      </section>

      {matchesQuery.isLoading ? (
        <section className="surface-card surface-card--soft">
          <p className="eyebrow">Loading history</p>
          <h2>Gathering finished matches from the API.</h2>
        </section>
      ) : matchesQuery.isError ? (
        <section className="surface-card surface-card--danger">
          <p className="eyebrow">History unavailable</p>
          <h2>The match list could not be loaded right now.</h2>
          <p>{matchesQuery.error instanceof Error ? matchesQuery.error.message : "Unexpected API failure."}</p>
        </section>
      ) : matches.length === 0 ? (
        <section className="surface-card surface-card--soft">
          <p className="eyebrow">No matches yet</p>
          <h2>Once finished sessions are persisted, they will appear here.</h2>
        </section>
      ) : (
        <section className="surface-card data-surface">
          <div className="section-heading section-heading--inline">
            <div>
              <p className="eyebrow">Recent results</p>
              <h2>{matches.length} finished matches loaded</h2>
            </div>
            <span className="meta-note">Each card links to a durable match-detail route.</span>
          </div>

          <div className="card-grid card-grid--records">
            {matches.map((match) => (
              <article key={match.matchId} className="record-card">
                <div className="record-card__header">
                  <div>
                    <p className="eyebrow">{formatEnumLabel(match.endReason)}</p>
                    <h3>{match.boardConfigKey}</h3>
                  </div>
                  <span className="status-chip status-chip--soft">{match.playerCount} players</span>
                </div>
                <p>
                  Winner {match.players.find((player) => player.finalRank === 1)?.displayNameSnapshot ?? "Unknown"}
                </p>
                <dl className="detail-list">
                  <div>
                    <dt>Started</dt>
                    <dd>{formatDateTime(match.startedAt)}</dd>
                  </div>
                  <div>
                    <dt>Finished</dt>
                    <dd>{formatDateTime(match.finishedAt)}</dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd>{formatEnumLabel(match.status)}</dd>
                  </div>
                  <div>
                    <dt>Match ID</dt>
                    <dd>{match.matchId}</dd>
                  </div>
                </dl>
                <Link className="button button--ghost" to={`/matches/${match.matchId}`}>
                  Open Match Detail
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}