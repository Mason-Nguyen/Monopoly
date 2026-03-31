import { Link, useParams } from "react-router-dom";
import { formatCurrency, formatDateTime, formatEnumLabel } from "../lib";
import { useMatchDetailQuery } from "../services";

export function MatchDetailPage() {
  const { matchId } = useParams();
  const matchQuery = useMatchDetailQuery(matchId ?? null);

  if (!matchId) {
    return (
      <section className="surface-card surface-card--danger">
        <p className="eyebrow">Invalid route</p>
        <h1>Match detail needs a valid match id.</h1>
        <Link className="button button--primary" to="/matches">
          Back to Match History
        </Link>
      </section>
    );
  }

  const match = matchQuery.data?.match;
  const rankedPlayers = match ? [...match.players].sort((left, right) => left.finalRank - right.finalRank) : [];

  return (
    <div className="page-stack">
      <section className="hero-panel hero-panel--compact">
        <div className="hero-panel__copy">
          <p className="eyebrow">Persisted result detail</p>
          <h1>Completed match snapshot</h1>
          <p className="lead">
            This route reads the durable match detail from the API and prepares the frontend for the
            handoff between live room completion and historical review.
          </p>
          <div className="cta-row cta-row--stacked-mobile">
            <Link className="button button--primary" to="/matches">
              Back to Match History
            </Link>
            <button
              className="button button--secondary"
              onClick={() => {
                void matchQuery.refetch();
              }}
              type="button"
            >
              {matchQuery.isFetching ? "Refreshing..." : "Refresh Detail"}
            </button>
          </div>
        </div>
      </section>

      {matchQuery.isLoading ? (
        <section className="surface-card surface-card--soft">
          <p className="eyebrow">Loading detail</p>
          <h2>Reading persisted match data for {matchId}.</h2>
        </section>
      ) : matchQuery.isError || !match ? (
        <section className="surface-card surface-card--danger">
          <p className="eyebrow">Detail unavailable</p>
          <h2>The requested match could not be loaded.</h2>
          <p>{matchQuery.error instanceof Error ? matchQuery.error.message : "The match may not exist yet."}</p>
        </section>
      ) : (
        <>
          <section className="surface-card data-surface">
            <div className="section-heading section-heading--inline">
              <div>
                <p className="eyebrow">Match summary</p>
                <h2>{formatEnumLabel(match.endReason)} on {match.boardConfigKey}</h2>
              </div>
              <span className="status-chip status-chip--soft">{match.playerCount} seats</span>
            </div>
            <dl className="detail-list detail-list--wide">
              <div>
                <dt>Status</dt>
                <dd>{formatEnumLabel(match.status)}</dd>
              </div>
              <div>
                <dt>Started</dt>
                <dd>{formatDateTime(match.startedAt)}</dd>
              </div>
              <div>
                <dt>Finished</dt>
                <dd>{formatDateTime(match.finishedAt)}</dd>
              </div>
              <div>
                <dt>Source lobby</dt>
                <dd>{match.sourceLobbyId ?? "No linked lobby"}</dd>
              </div>
            </dl>
          </section>

          <section className="surface-card data-surface">
            <div className="section-heading section-heading--inline">
              <div>
                <p className="eyebrow">Final rankings</p>
                <h2>Resolved player outcomes</h2>
              </div>
              <span className="meta-note">Sorted by final rank from the persisted snapshot.</span>
            </div>
            <div className="record-list">
              {rankedPlayers.map((player) => (
                <article key={player.userId} className="record-row">
                  <div className="record-row__leading">
                    <span className="rank-pill">#{player.finalRank}</span>
                    <div>
                      <h3>{player.displayNameSnapshot}</h3>
                      <p>Turn order {player.turnOrder} / Position {player.finalPosition}</p>
                    </div>
                  </div>
                  <div className="record-row__stats">
                    <span>
                      <strong>{formatCurrency(player.finalBalance)}</strong>
                      balance
                    </span>
                    <span>
                      <strong>{player.isBankrupt ? "Yes" : "No"}</strong>
                      bankrupt
                    </span>
                    <span>
                      <strong>{player.isAbandoned ? "Yes" : "No"}</strong>
                      abandoned
                    </span>
                    <span>
                      <strong>{formatEnumLabel(player.eliminationReason)}</strong>
                      elimination
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}