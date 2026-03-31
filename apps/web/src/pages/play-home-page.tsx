import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { truncateIdentifier } from "../services";
import { useSessionStore } from "../stores";

const previewCards = [
  {
    title: "Leaderboard",
    copy: "Review the current standings and spot the players who keep surviving the board.",
    to: "/leaderboard"
  },
  {
    title: "Match History",
    copy: "Inspect recent outcomes, finished boards, and durable match summaries.",
    to: "/matches"
  }
];

export function PlayHomePage() {
  const playerId = useSessionStore((state) => state.playerId);
  const displayName = useSessionStore((state) => state.displayName);
  const lastLobbyId = useSessionStore((state) => state.lastLobbyId);
  const lastMatchId = useSessionStore((state) => state.lastMatchId);
  const ensureGuestSession = useSessionStore((state) => state.ensureGuestSession);
  const setDisplayName = useSessionStore((state) => state.setDisplayName);
  const clearSession = useSessionStore((state) => state.clearSession);
  const [draftName, setDraftName] = useState(displayName);

  useEffect(() => {
    ensureGuestSession();
  }, [ensureGuestSession]);

  useEffect(() => {
    setDraftName(displayName);
  }, [displayName]);

  const hasContinuation = lastLobbyId !== null || lastMatchId !== null;

  return (
    <div className="page-stack">
      <section className="hero-panel hero-panel--compact">
        <div className="hero-panel__copy">
          <p className="eyebrow">Phase 11 implementation</p>
          <h1>Your table hub is live.</h1>
          <p className="lead">
            This shell is now a real routed frontend foundation. Use it to enter multiplayer flow,
            preview durable product surfaces, and prepare the match shell that Phase 12 will wrap
            around the 2.5D board.
          </p>
        </div>
      </section>

      <section className="menu-grid">
        <article className="menu-card menu-card--primary">
          <p className="eyebrow">Primary multiplayer flow</p>
          <h2>Find the next live room</h2>
          <p>
            Browse open lobbies, bring in your crew, and move straight into the host-controlled
            match start path.
          </p>
          <div className="cta-row cta-row--stacked-mobile">
            <Link className="button button--primary" to="/lobbies">
              Browse Lobbies
            </Link>
            <Link className="button button--ghost" to="/lobbies/copper-corner">
              Open Featured Lobby
            </Link>
          </div>
        </article>

        <article className="menu-card">
          <p className="eyebrow">Player alias</p>
          <h2>Choose your table name</h2>
          <p>
            MVP still runs without full auth, so this local identity keeps the frontend ready for
            lobby and reconnect flows.
          </p>
          <form
            className="inline-form"
            onSubmit={(event) => {
              event.preventDefault();
              setDisplayName(draftName);
            }}
          >
            <label className="field-label" htmlFor="display-name">
              Display name
            </label>
            <div className="input-row">
              <input
                id="display-name"
                maxLength={24}
                onChange={(event) => setDraftName(event.target.value)}
                placeholder="Seat your crew with a name"
                value={draftName}
              />
              <button className="button button--secondary" type="submit">
                Save
              </button>
            </div>
          </form>
          <div className="identity-footnote">
            <span className="status-chip status-chip--soft">
              {displayName.length > 0 ? `Current alias: ${displayName}` : "No alias saved yet"}
            </span>
            <span className="status-chip status-chip--ghost">
              {playerId ? `Guest ID ${truncateIdentifier(playerId, 6, 4)}` : "Guest ID unavailable"}
            </span>
            <button className="text-link" onClick={clearSession} type="button">
              Reset local session
            </button>
          </div>
        </article>

        <article className="menu-card menu-card--continuity">
          <p className="eyebrow">Session continuity</p>
          <h2>{hasContinuation ? "Resume your place at the table" : "No unfinished session yet"}</h2>
          <p>
            {hasContinuation
              ? "The client found previous lobby or match metadata. Use it as the future reconnect entry point."
              : "Reconnect metadata will appear here once lobby and match routes start writing live session context."}
          </p>
          <div className="continuity-status">
            <span className="status-chip status-chip--ghost">
              {lastLobbyId ? `Lobby saved: ${lastLobbyId}` : "No lobby saved"}
            </span>
            <span className="status-chip status-chip--ghost">
              {lastMatchId ? `Match saved: ${lastMatchId}` : "No match saved"}
            </span>
          </div>
          <div className="cta-row cta-row--stacked-mobile">
            <Link className="button button--primary" to={lastMatchId ? `/match/${lastMatchId}` : "/lobbies"}>
              {lastMatchId ? "Resume Match" : "Start with Lobbies"}
            </Link>
            <Link className="button button--ghost" to={lastLobbyId ? `/lobbies/${lastLobbyId}` : "/matches"}>
              {lastLobbyId ? "Return to Lobby" : "Open Match History"}
            </Link>
          </div>
        </article>

        {previewCards.map((card) => (
          <article key={card.title} className="menu-card">
            <p className="eyebrow">Meta surface</p>
            <h2>{card.title}</h2>
            <p>{card.copy}</p>
            <Link className="button button--ghost" to={card.to}>
              Open {card.title}
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}