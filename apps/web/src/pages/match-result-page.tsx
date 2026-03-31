import { Link, useParams } from "react-router-dom";
import { formatDateTime, formatEnumLabel } from "../lib";
import { useMatchDetailQuery } from "../services";

export function MatchResultPage() {
  const { matchId } = useParams();
  const matchQuery = useMatchDetailQuery(matchId ?? null);
  const persistedMatch = matchQuery.data?.match;

  return (
    <div className="page-stack">
      <section className="hero-panel hero-panel--compact">
        <div className="hero-panel__copy">
          <p className="eyebrow">Result handoff</p>
          <h1>Live-to-durable match conclusion route</h1>
          <p className="lead">
            This screen is ready to receive either live result state or the persisted match detail.
            Today it already attempts the durable fallback so the UI contract is in place before the
            full live handoff wiring lands.
          </p>
          <div className="cta-row cta-row--stacked-mobile">
            <Link className="button button--primary" to="/matches">
              Open Match History
            </Link>
            <Link className="button button--ghost" to={matchId ? `/match/${matchId}` : "/play"}>
              Back to Match Shell
            </Link>
          </div>
        </div>
      </section>

      {persistedMatch ? (
        <section className="surface-card data-surface">
          <div className="section-heading section-heading--inline">
            <div>
              <p className="eyebrow">Persisted fallback loaded</p>
              <h2>{formatEnumLabel(persistedMatch.endReason)} result</h2>
            </div>
            <span className="status-chip status-chip--soft">Finished {formatDateTime(persistedMatch.finishedAt)}</span>
          </div>
          <p>
            Winner: {persistedMatch.players.find((player) => player.finalRank === 1)?.displayNameSnapshot ?? "Unknown"}
          </p>
          <Link className="button button--ghost" to={`/matches/${persistedMatch.matchId}`}>
            Open Durable Detail
          </Link>
        </section>
      ) : (
        <section className="surface-card surface-card--soft">
          <p className="eyebrow">Waiting for durable handoff</p>
          <h2>No persisted result was found for this match yet.</h2>
          <p>
            That is okay for now. This route still acts as the dedicated finished-match surface so
            the live shell does not need to carry end-of-match UI forever.
          </p>
        </section>
      )}
    </div>
  );
}