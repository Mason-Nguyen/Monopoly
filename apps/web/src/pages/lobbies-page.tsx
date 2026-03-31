import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MVP_MAX_PLAYERS, MVP_MIN_PLAYERS } from "@monopoly/shared-config";
import { formatDateTime } from "../lib";
import {
  getColyseusClient,
  useLobbyPreviewListQuery
} from "../services";
import { registerActiveLobbyRoom } from "../services/live-room-registry";
import { useSessionStore } from "../stores";

export function LobbiesPage() {
  const navigate = useNavigate();
  const playerId = useSessionStore((state) => state.playerId);
  const displayName = useSessionStore((state) => state.displayName);
  const lastLobbyId = useSessionStore((state) => state.lastLobbyId);
  const setLastLobbyId = useSessionStore((state) => state.setLastLobbyId);
  const [creatingLiveLobby, setCreatingLiveLobby] = useState(false);
  const [liveLobbyError, setLiveLobbyError] = useState<string | null>(null);
  const lobbiesQuery = useLobbyPreviewListQuery({
    playerId: playerId ?? undefined,
    displayName
  });

  const lobbies = lobbiesQuery.data?.lobbies ?? [];
  const readyToStartCount = lobbies.filter((lobby) => lobby.seats.length >= MVP_MIN_PLAYERS && lobby.seats.every((seat) => seat.isReady)).length;
  const reconnectReservedCount = lobbies.filter((lobby) =>
    lobby.seats.some((seat) => seat.connectionState === "reconnect_reserved")
  ).length;
  const openSeatCount = lobbies.reduce((total, lobby) => total + Math.max(0, MVP_MAX_PLAYERS - lobby.seats.length), 0);

  async function handleCreateLiveLobby() {
    if (!playerId) {
      setLiveLobbyError("A local player session is required before creating a live lobby.");
      return;
    }

    setCreatingLiveLobby(true);
    setLiveLobbyError(null);

    try {
      const room = await getColyseusClient().create("lobby", {
        playerId,
        displayName
      });

      registerActiveLobbyRoom(room);
      setLastLobbyId(room.roomId);
      navigate(`/lobbies/${room.roomId}`);
    } catch (error) {
      setLiveLobbyError(error instanceof Error ? error.message : "The live lobby could not be created.");
    } finally {
      setCreatingLiveLobby(false);
    }
  }

  return (
    <div className="page-stack">
      <section className="hero-panel hero-panel--compact">
        <div className="hero-panel__copy">
          <p className="eyebrow">Pre-match discovery</p>
          <h1>Lobby browsing is now a real multiplayer surface.</h1>
          <p className="lead">
            Preview cards still help shape the experience, but this route can now bootstrap a real
            live lobby and hand the room off into the dedicated lobby route without redesigning the
            DOM shell.
          </p>
          <div className="chip-row">
            <span className="chip">{MVP_MIN_PLAYERS}-{MVP_MAX_PLAYERS} seats per room</span>
            <span className="chip">Host starts the match</span>
            <span className="chip">Guest alias: {displayName}</span>
          </div>
          <div className="cta-row cta-row--stacked-mobile">
            <button
              className="button button--primary"
              disabled={creatingLiveLobby}
              onClick={() => {
                void handleCreateLiveLobby();
              }}
              type="button"
            >
              {creatingLiveLobby ? "Creating Live Lobby..." : "Create Live Lobby"}
            </button>
            <Link className="button button--ghost" to="/play">
              Return to Hub
            </Link>
          </div>
          {liveLobbyError ? (
            <div className="detail-inline detail-inline--wrap">
              <span className="status-chip status-chip--warn">Live create failed</span>
              <span className="status-chip status-chip--ghost">{liveLobbyError}</span>
            </div>
          ) : null}
        </div>
      </section>

      {lobbiesQuery.isLoading ? (
        <section className="surface-card surface-card--soft">
          <p className="eyebrow">Loading rooms</p>
          <h2>Preparing the next set of tables.</h2>
        </section>
      ) : lobbiesQuery.isError ? (
        <section className="surface-card surface-card--danger">
          <p className="eyebrow">Lobby list unavailable</p>
          <h2>The room list could not be prepared right now.</h2>
          <p>{lobbiesQuery.error instanceof Error ? lobbiesQuery.error.message : "Unexpected lobby query failure."}</p>
        </section>
      ) : (
        <>
          <section className="summary-grid">
            <article className="summary-card">
              <p className="eyebrow">Open seats</p>
              <strong>{openSeatCount}</strong>
              <span>available seats across the preview room list</span>
            </article>
            <article className="summary-card">
              <p className="eyebrow">Ready to launch</p>
              <strong>{readyToStartCount}</strong>
              <span>rooms already meeting the host-start readiness gate</span>
            </article>
            <article className="summary-card">
              <p className="eyebrow">Reconnect held</p>
              <strong>{reconnectReservedCount}</strong>
              <span>rooms still holding a reconnect reservation for a player</span>
            </article>
          </section>

          <section className="card-grid card-grid--records">
            {lobbies.map((lobby) => {
              const readyCount = lobby.seats.filter((seat) => seat.isReady).length;
              const reconnectHeld = lobby.seats.some((seat) => seat.connectionState === "reconnect_reserved");
              const currentSeat = lobby.seats.find((seat) => seat.isCurrentPlayer);
              const canStart = lobby.seats.length >= MVP_MIN_PLAYERS && readyCount === lobby.seats.length;

              return (
                <article key={lobby.lobbyId} className="record-card record-card--tall">
                  <div className="record-card__header">
                    <div>
                      <p className="eyebrow">Created {formatDateTime(lobby.createdAt)}</p>
                      <h3>{lobby.title}</h3>
                    </div>
                    <span className="status-chip status-chip--soft">{lobby.seats.length}/{lobby.maxPlayers} seats</span>
                  </div>

                  <p>{lobby.phaseNote}</p>

                  <div className="detail-inline detail-inline--wrap">
                    <span className="status-chip status-chip--ghost">{readyCount} ready</span>
                    <span className="status-chip status-chip--ghost">{canStart ? "Start gate clear" : "Waiting on readiness"}</span>
                    {reconnectHeld ? <span className="status-chip status-chip--warn">Reconnect seat held</span> : null}
                    {currentSeat?.isHost ? <span className="status-chip status-chip--soft">You are host</span> : null}
                    {lastLobbyId === lobby.lobbyId ? <span className="status-chip status-chip--ghost">Saved in session</span> : null}
                  </div>

                  <div className="record-card__meta-stack">
                    <span>
                      <strong>Room mode:</strong> {lobby.status === "starting" ? "Starting soon" : "Waiting room"}
                    </span>
                    <span>
                      <strong>Your seat:</strong> {currentSeat ? `Seat ${currentSeat.seatNumber}` : "Not seated"}
                    </span>
                    <span>
                      <strong>Board:</strong> {lobby.boardName}
                    </span>
                  </div>

                  <Link className="button button--ghost" to={`/lobbies/${lobby.lobbyId}`}>
                    {lastLobbyId === lobby.lobbyId ? "Return to Saved Lobby" : "Open Preview Lobby"}
                  </Link>
                </article>
              );
            })}
          </section>
        </>
      )}
    </div>
  );
}