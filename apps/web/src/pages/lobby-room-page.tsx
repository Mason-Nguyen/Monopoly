import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MVP_MIN_PLAYERS } from "@monopoly/shared-config";
import { useLiveLobbyRoom } from "../hooks";
import { formatDateTime } from "../lib";
import { useLobbyPreviewDetailQuery } from "../services";
import { useSessionStore } from "../stores";

export function LobbyRoomPage() {
  const { lobbyId } = useParams();
  const navigate = useNavigate();
  const playerId = useSessionStore((state) => state.playerId);
  const displayName = useSessionStore((state) => state.displayName);
  const setLastLobbyId = useSessionStore((state) => state.setLastLobbyId);
  const setLastMatchId = useSessionStore((state) => state.setLastMatchId);
  const setLastMatchRoomId = useSessionStore((state) => state.setLastMatchRoomId);
  const [localReadyOverride, setLocalReadyOverride] = useState<boolean | null>(null);

  const liveLobby = useLiveLobbyRoom({
    lobbyId: lobbyId ?? null,
    playerId,
    displayName
  });
  const previewQuery = useLobbyPreviewDetailQuery(lobbyId ?? null, {
    playerId: playerId ?? undefined,
    displayName
  });

  useEffect(() => {
    setLastLobbyId(lobbyId ?? null);
  }, [lobbyId, setLastLobbyId]);

  useEffect(() => {
    setLocalReadyOverride(null);
  }, [lobbyId]);

  useEffect(() => {
    if (!liveLobby.matchStartingEvent) {
      return;
    }

    setLastMatchId(liveLobby.matchStartingEvent.matchId);
    setLastMatchRoomId(liveLobby.matchStartingEvent.roomId);
    navigate(`/match/${liveLobby.matchStartingEvent.matchId}`);
  }, [liveLobby.matchStartingEvent, navigate, setLastMatchId, setLastMatchRoomId]);

  const isUsingLiveLobby = liveLobby.isLive && liveLobby.lobby !== null;
  const previewLobby = previewQuery.data?.lobby ?? null;
  const lobby = isUsingLiveLobby ? liveLobby.lobby : previewLobby;
  const isPreviewFallback = !isUsingLiveLobby && previewLobby !== null;
  const effectiveSeats = lobby
    ? lobby.seats.map((seat) => {
        if (isUsingLiveLobby || !seat.isCurrentPlayer || localReadyOverride === null) {
          return seat;
        }

        return {
          ...seat,
          isReady: localReadyOverride
        };
      })
    : [];
  const currentSeat = effectiveSeats.find((seat) => seat.isCurrentPlayer) ?? null;
  const readyCount = effectiveSeats.filter((seat) => seat.isReady).length;
  const reconnectReservedCount = effectiveSeats.filter((seat) => seat.connectionState === "reconnect_reserved").length;
  const hasMinimumPlayers = effectiveSeats.length >= MVP_MIN_PLAYERS;
  const allReady = effectiveSeats.length > 0 && readyCount === effectiveSeats.length;
  const currentPlayerIsHost = currentSeat?.isHost ?? false;
  const canStartMatch = currentPlayerIsHost && hasMinimumPlayers && allReady;

  let startGateMessage = "Only the host can start the room.";
  if (currentPlayerIsHost) {
    if (!hasMinimumPlayers) {
      startGateMessage = `The room needs at least ${MVP_MIN_PLAYERS} players before launch.`;
    } else if (!allReady) {
      startGateMessage = "The host can start once every seated player is ready.";
    } else if (isUsingLiveLobby) {
      startGateMessage = "All live seats are ready. Starting the match will request a real room handoff.";
    } else {
      startGateMessage = "All seats are ready. The room can hand off into the preview match shell.";
    }
  }

  if (!lobbyId) {
    return (
      <section className="surface-card surface-card--danger">
        <p className="eyebrow">Invalid lobby route</p>
        <h1>A lobby id is required to open the room shell.</h1>
      </section>
    );
  }

  return (
    <div className="page-stack">
      <section className="hero-panel hero-panel--compact">
        <div className="hero-panel__copy">
          <p className="eyebrow">Pre-match room</p>
          <h1>{lobby?.title ?? lobbyId}</h1>
          <p className="lead">
            This route now prefers a real Colyseus lobby connection when the room exists, but it can
            still fall back to the preview shell so the UI stays usable while live rooms are absent.
          </p>
          <div className="detail-inline detail-inline--wrap">
            <span className={isUsingLiveLobby ? "status-chip status-chip--soft" : "status-chip status-chip--ghost"}>
              {isUsingLiveLobby ? `Live room ${liveLobby.roomId}` : "Preview fallback"}
            </span>
            {liveLobby.status === "connecting" ? (
              <span className="status-chip status-chip--ghost">Connecting to live lobby...</span>
            ) : null}
            {liveLobby.error && !isPreviewFallback ? (
              <span className="status-chip status-chip--warn">{liveLobby.error.message}</span>
            ) : null}
          </div>
        </div>
      </section>

      {previewQuery.isLoading && liveLobby.status === "connecting" ? (
        <section className="surface-card surface-card--soft">
          <p className="eyebrow">Loading room</p>
          <h2>Preparing the room surface and live connection.</h2>
        </section>
      ) : !lobby ? (
        <section className="surface-card surface-card--danger">
          <p className="eyebrow">Room unavailable</p>
          <h2>The requested lobby could not be loaded.</h2>
          <p>
            {liveLobby.error?.message
              ?? (previewQuery.error instanceof Error ? previewQuery.error.message : "This lobby does not exist.")}
          </p>
        </section>
      ) : (
        <>
          {reconnectReservedCount > 0 ? (
            <section className="surface-card surface-card--warn lobby-banner">
              <p className="eyebrow">Reconnect reservation active</p>
              <h2>{reconnectReservedCount} seat is still being held for a returning player.</h2>
              <p>
                The room keeps this state visible so players understand why the host may delay the
                final start click.
              </p>
            </section>
          ) : null}

          <section className="summary-grid">
            <article className="summary-card">
              <p className="eyebrow">Seats filled</p>
              <strong>{effectiveSeats.length}</strong>
              <span>{hasMinimumPlayers ? "Minimum player gate reached" : "Need more players before launch"}</span>
            </article>
            <article className="summary-card">
              <p className="eyebrow">Ready seats</p>
              <strong>{readyCount}/{effectiveSeats.length}</strong>
              <span>{allReady ? "All seated players are ready" : "The room is still waiting on ready confirmations"}</span>
            </article>
            <article className="summary-card">
              <p className="eyebrow">Host start gate</p>
              <strong>{canStartMatch ? "Open" : "Blocked"}</strong>
              <span>{startGateMessage}</span>
            </article>
          </section>

          <section className="surface-card data-surface">
            <div className="section-heading section-heading--inline">
              <div>
                <p className="eyebrow">Room controls</p>
                <h2>Ready-state and launch actions</h2>
              </div>
              <span className="meta-note">Created {formatDateTime(lobby.createdAt)} / {lobby.phaseNote}</span>
            </div>

            <div className="cta-row cta-row--stacked-mobile">
              {currentSeat ? (
                <button
                  className={currentSeat.isReady ? "button button--secondary" : "button button--primary"}
                  onClick={() => {
                    if (isUsingLiveLobby) {
                      void liveLobby.setReady(!currentSeat.isReady);
                    } else {
                      setLocalReadyOverride((value) => !(value ?? currentSeat.isReady));
                    }
                  }}
                  type="button"
                >
                  {currentSeat.isReady ? "Set Not Ready" : "Set Ready"}
                </button>
              ) : null}

              <button
                className={canStartMatch ? "button button--primary" : "button button--ghost"}
                disabled={!canStartMatch}
                onClick={() => {
                  if (!canStartMatch) {
                    return;
                  }

                  if (isUsingLiveLobby) {
                    void liveLobby.startMatch();
                    return;
                  }

                  const previewMatchId = `${lobby.lobbyId}-live-preview`;
                  setLastMatchId(previewMatchId);
                  navigate(`/match/${previewMatchId}`);
                }}
                type="button"
              >
                {currentPlayerIsHost
                  ? (isUsingLiveLobby ? "Start Live Match" : "Start Match Preview")
                  : "Host Start Unavailable"}
              </button>
            </div>

            <div className="detail-inline detail-inline--wrap">
              {currentSeat ? (
                <span className="status-chip status-chip--soft">
                  You are in seat {currentSeat.seatNumber}{currentSeat.isHost ? " as host" : ""}
                </span>
              ) : null}
              <span className="status-chip status-chip--ghost">Board {lobby.boardName}</span>
              <span className="status-chip status-chip--ghost">Room status {lobby.status}</span>
            </div>
          </section>

          <section className="surface-card data-surface">
            <div className="section-heading section-heading--inline">
              <div>
                <p className="eyebrow">Room roster</p>
                <h2>Seat layout prepared for live lobby state</h2>
              </div>
              <span className="meta-note">This route writes lobby continuity into local session state for reconnect-safe frontend flow.</span>
            </div>
            <div className="seat-grid">
              {effectiveSeats.map((seat) => (
                <article
                  key={seat.playerId}
                  className={[
                    "seat-card",
                    seat.isCurrentPlayer ? "seat-card--current" : "",
                    seat.connectionState === "reconnect_reserved" ? "seat-card--reserved" : ""
                  ].join(" ").trim()}
                >
                  <div className="seat-card__header">
                    <div>
                      <p className="eyebrow">Seat {seat.seatNumber}</p>
                      <h3>{seat.displayName}</h3>
                    </div>
                    <div className="seat-card__badges">
                      {seat.isHost ? <span className="status-chip status-chip--soft">Host</span> : null}
                      {seat.isCurrentPlayer ? <span className="status-chip status-chip--ghost">You</span> : null}
                      {seat.connectionState === "reconnect_reserved" ? <span className="status-chip status-chip--warn">Reconnect held</span> : null}
                    </div>
                  </div>
                  <p>{seat.note}</p>
                  <div className="detail-inline detail-inline--wrap">
                    <span className={seat.isReady ? "status-chip status-chip--soft" : "status-chip status-chip--ghost"}>
                      {seat.isReady ? "Ready" : "Waiting"}
                    </span>
                    <span className="status-chip status-chip--ghost">Connection {seat.connectionState === "connected" ? "stable" : "reserved"}</span>
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