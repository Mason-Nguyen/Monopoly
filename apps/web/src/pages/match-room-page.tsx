import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useLiveMatchRoom } from "../features";
import { formatCurrency } from "../lib";
import { useMatchShellPreviewQuery } from "../services";
import { useMatchUiStore, useSessionStore } from "../stores";

export function MatchRoomPage() {
  const { matchId } = useParams();
  const playerId = useSessionStore((state) => state.playerId);
  const displayName = useSessionStore((state) => state.displayName);
  const setLastMatchId = useSessionStore((state) => state.setLastMatchId);
  const selectedPanel = useMatchUiStore((state) => state.selectedPanel);
  const liveMatch = useLiveMatchRoom();
  const previewQuery = useMatchShellPreviewQuery(liveMatch.isLive ? null : matchId ?? null, {
    playerId: playerId ?? undefined,
    displayName
  });

  useEffect(() => {
    setLastMatchId(matchId ?? null);
  }, [matchId, setLastMatchId]);

  const preview = liveMatch.preview ?? previewQuery.data;

  return (
    <div className="match-stage-stack">
      <section className="playfield-card playfield-card--enhanced">
        <div className="playfield-card__header">
          <div>
            <p className="eyebrow">Live match shell</p>
            <h1>{matchId ?? "Unknown match"}</h1>
          </div>
          <span className={liveMatch.isLive ? "status-chip status-chip--soft" : "status-chip status-chip--ghost"}>
            {liveMatch.isLive ? `Live room ${liveMatch.roomId}` : `Panel focus ${selectedPanel}`}
          </span>
        </div>
        <p className="lead lead--compact">
          The DOM shell now carries a real HUD structure while still protecting the center lane for
          the future 2.5D board renderer.
        </p>
        <div className="detail-inline detail-inline--wrap">
          <span className="status-chip status-chip--ghost">
            {preview ? `Current tile ${preview.currentTileName}` : "Waiting on match preview"}
          </span>
          <span className="status-chip status-chip--ghost">
            {preview ? `Phase ${preview.phaseLabel}` : "Match phase unavailable"}
          </span>
          <Link className="button button--ghost" to={`/match/${matchId ?? "demo-live-room"}/result`}>
            Open Result Handoff
          </Link>
        </div>
      </section>

      {liveMatch.status === "connecting" && !preview ? (
        <section className="surface-card surface-card--soft">
          <p className="eyebrow">Loading stage</p>
          <h2>Preparing live economy and board-window state.</h2>
        </section>
      ) : previewQuery.isError && !preview ? (
        <section className="surface-card surface-card--danger">
          <p className="eyebrow">Stage unavailable</p>
          <h2>The match stage could not be prepared.</h2>
          <p>{previewQuery.error instanceof Error ? previewQuery.error.message : "Unexpected shell preview error."}</p>
        </section>
      ) : preview ? (
        <>
          <section className="economy-grid">
            <article className="economy-card">
              <p className="eyebrow">Cash on hand</p>
              <strong>{formatCurrency(preview.economy.localBalance)}</strong>
              <span>Local player balance in the current room state</span>
            </article>
            <article className="economy-card">
              <p className="eyebrow">Owned properties</p>
              <strong>{preview.economy.ownedPropertyCount}</strong>
              <span>Property cards already under local control</span>
            </article>
            <article className="economy-card">
              <p className="eyebrow">Next opportunity</p>
              <strong>{preview.economy.nextBuyOpportunity}</strong>
              <span>
                {preview.economy.nextBuyCost !== null
                  ? `Estimated buy cost ${formatCurrency(preview.economy.nextBuyCost)}`
                  : "No purchase branch is active right now"}
              </span>
            </article>
          </section>

          <section className="surface-card data-surface">
            <div className="section-heading section-heading--inline">
              <div>
                <p className="eyebrow">Board window</p>
                <h2>Playfield reserve with contextual tiles</h2>
              </div>
              <span className="meta-note">This lane stays visually protected for Phase 12.</span>
            </div>
            <div className="board-window-grid">
              {preview.boardWindow.map((tile) => (
                <article key={tile.tileIndex} className={`tile-preview tile-preview--${tile.tileType}`}>
                  <span>#{tile.tileIndex}</span>
                  <strong>{tile.name}</strong>
                  <small>{tile.tileType}</small>
                </article>
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="surface-card surface-card--soft">
          <p className="eyebrow">Waiting on match</p>
          <h2>No room state is available yet.</h2>
        </section>
      )}
    </div>
  );
}