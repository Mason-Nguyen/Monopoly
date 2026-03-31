import { Suspense, lazy, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useLiveMatchRoom } from "../features";
import { formatCurrency } from "../lib";
import { useMatchShellPreviewQuery } from "../services";
import { useMatchUiStore, useSessionStore } from "../stores";

const MatchBoardScene = lazy(async () => ({
  default: (await import("../features/match/match-board-scene")).MatchBoardScene
}));

export function MatchRoomPage() {
  const { matchId } = useParams();
  const playerId = useSessionStore((state) => state.playerId);
  const displayName = useSessionStore((state) => state.displayName);
  const setLastMatchId = useSessionStore((state) => state.setLastMatchId);
  const setSelectedPanel = useMatchUiStore((state) => state.setSelectedPanel);
  const pendingCommandId = useMatchUiStore((state) => state.pendingCommandId);
  const setPendingCommandId = useMatchUiStore((state) => state.setPendingCommandId);
  const clearPendingCommand = useMatchUiStore((state) => state.clearPendingCommand);
  const liveMatch = useLiveMatchRoom();
  const previewQuery = useMatchShellPreviewQuery(liveMatch.isLive ? null : matchId ?? null, {
    playerId: playerId ?? undefined,
    displayName
  });

  useEffect(() => {
    setLastMatchId(matchId ?? null);
  }, [matchId, setLastMatchId]);

  const preview = liveMatch.preview ?? previewQuery.data;

  async function handleAction(actionId: string, enabled: boolean) {
    if (!enabled) {
      return;
    }

    setSelectedPanel("actions");
    setPendingCommandId(actionId);

    if (!liveMatch.isLive) {
      window.setTimeout(() => {
        clearPendingCommand();
      }, 900);
      return;
    }

    try {
      if (actionId === "roll_dice") {
        await liveMatch.sendRollDice();
      } else if (actionId === "buy_property") {
        await liveMatch.sendBuyProperty();
      } else if (actionId === "end_turn") {
        await liveMatch.sendEndTurn();
      }
    } finally {
      clearPendingCommand();
    }
  }

  return (
    <div className="match-stage-stack match-stage-stack--boarded">
      {liveMatch.status === "connecting" && !preview ? (
        <section className="surface-card surface-card--soft">
          <p className="eyebrow">Loading stage</p>
          <h2>Preparing the first 2.5D board scene.</h2>
          <p>The playfield is synchronizing before the board can project room state.</p>
        </section>
      ) : previewQuery.isError && !preview ? (
        <section className="surface-card surface-card--danger">
          <p className="eyebrow">Stage unavailable</p>
          <h2>The match stage could not be prepared.</h2>
          <p>{previewQuery.error instanceof Error ? previewQuery.error.message : "Unexpected shell preview error."}</p>
        </section>
      ) : preview ? (
        <>
          <section className="match-board-stage">
            <div className="match-board-stage__frame">
              <Suspense
                fallback={
                  <div className="match-board-scene match-board-scene--loading">
                    <div className="match-board-scene__loading-card">
                      <p className="eyebrow">Loading board scene</p>
                      <h2>Preparing tabletop camera and board shell.</h2>
                    </div>
                  </div>
                }
              >
                <MatchBoardScene preview={preview} />
              </Suspense>
            </div>
            <div className="match-board-stage__caption">
              <span className="status-chip status-chip--ghost">{preview.currentTileName}</span>
              <span className="status-chip status-chip--ghost">Wider horizontal scene stage</span>
              <span className="status-chip status-chip--ghost">Larger tile surfaces for future art</span>
            </div>
          </section>

          <section className="match-action-tray">
            <div className="match-action-tray__copy">
              <p className="eyebrow">Action tray</p>
              <h2>{preview.phaseLabel}</h2>
              <p>
                The board now leads with a wider horizontal footprint while actions stay shallow below the scene.
              </p>
            </div>
            <div className="match-action-tray__buttons">
              {preview.actions.map((action) => {
                const variant =
                  action.tone === "primary"
                    ? "button button--primary"
                    : action.tone === "secondary"
                      ? "button button--secondary"
                      : "button button--ghost";
                const isPending = pendingCommandId === action.id;

                return (
                  <button
                    key={action.id}
                    className={`${variant} match-action-tray__button`}
                    disabled={!action.enabled || (pendingCommandId !== null && !isPending)}
                    onClick={() => {
                      void handleAction(action.id, action.enabled);
                    }}
                    type="button"
                  >
                    {isPending ? (liveMatch.isLive ? "Sending Live Command..." : "Sending Preview...") : action.label}
                  </button>
                );
              })}
            </div>
            <div className="match-action-tray__context">
              <span className="status-chip status-chip--soft">
                {preview.actions.find((action) => action.id === pendingCommandId)?.description ?? preview.actions[0]?.description}
              </span>
              <Link className="button button--ghost" to={`/match/${matchId ?? "demo-live-room"}/result`}>
                Open Result Handoff
              </Link>
              <span className="status-chip status-chip--ghost">Local cash {formatCurrency(preview.economy.localBalance)}</span>
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