import { Link, Outlet, useLocation, useParams } from "react-router-dom";
import { formatCurrency } from "../../lib";
import { truncateIdentifier, useMatchShellPreviewQuery } from "../../services";
import { useMatchUiStore, useSessionStore } from "../../stores";
import { LiveMatchRoomProvider, useLiveMatchRoom } from "./live-match-room-context";

function Wordmark() {
  return (
    <Link className="wordmark" to="/">
      <span className="wordmark__badge">MT</span>
      <span>
        <strong>Monopoly Table</strong>
        <small>browser multiplayer club</small>
      </span>
    </Link>
  );
}

function MatchShellFrame() {
  const { matchId } = useParams();
  const location = useLocation();
  const playerId = useSessionStore((state) => state.playerId);
  const displayName = useSessionStore((state) => state.displayName);
  const selectedPanel = useMatchUiStore((state) => state.selectedPanel);
  const feedFilter = useMatchUiStore((state) => state.feedFilter);
  const pendingCommandId = useMatchUiStore((state) => state.pendingCommandId);
  const setSelectedPanel = useMatchUiStore((state) => state.setSelectedPanel);
  const setFeedFilter = useMatchUiStore((state) => state.setFeedFilter);
  const setPendingCommandId = useMatchUiStore((state) => state.setPendingCommandId);
  const clearPendingCommand = useMatchUiStore((state) => state.clearPendingCommand);
  const liveMatch = useLiveMatchRoom();
  const previewQuery = useMatchShellPreviewQuery(liveMatch.isLive ? null : matchId ?? null, {
    playerId: playerId ?? undefined,
    displayName
  });
  const isResultRoute = location.pathname.endsWith("/result");
  const preview = liveMatch.preview ?? previewQuery.data ?? null;
  const filteredFeed = preview
    ? preview.feed.filter((entry) => feedFilter === "all" || entry.kind === feedFilter)
    : [];

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
    <div className="site-shell match-layout">
      <header className="topbar topbar--match">
        <Wordmark />
        <nav className="topbar__links" aria-label="Match navigation">
          <Link to="/play">Home</Link>
          <Link to="/lobbies">Lobbies</Link>
          <Link to="/matches">Match History</Link>
        </nav>
      </header>
      <main className="match-layout__main">
        <aside className="match-layout__rail match-layout__rail--left">
          {liveMatch.status === "connecting" && !preview ? (
            <div className="match-rail-section">
              <p className="sidebar__eyebrow">Connecting</p>
              <h2>Preparing live HUD</h2>
              <p>The match shell is synchronizing with Colyseus room state.</p>
            </div>
          ) : previewQuery.isError && !preview ? (
            <div className="match-rail-section">
              <p className="sidebar__eyebrow">Shell unavailable</p>
              <h2>Match HUD failed</h2>
              <p>{previewQuery.error instanceof Error ? previewQuery.error.message : "Unexpected shell preview error."}</p>
            </div>
          ) : preview ? (
            <>
              <section className="match-rail-section">
                <p className="sidebar__eyebrow">{isResultRoute ? "Result context" : "Live match"}</p>
                <h2>{isResultRoute ? "Finished-session shell" : `Turn ${preview.turnNumber}`}</h2>
                <p>{isResultRoute ? `Result handoff for ${preview.matchId}.` : `${preview.phaseLabel} on ${preview.currentTileName}.`}</p>
                <div className="detail-inline detail-inline--wrap">
                  <span className="status-chip status-chip--soft">Focus {selectedPanel}</span>
                  <span className="status-chip status-chip--ghost">Active {preview.players.find((player) => player.isActiveTurn)?.displayName ?? "Unknown"}</span>
                  <span className={liveMatch.isLive ? "status-chip status-chip--soft" : "status-chip status-chip--ghost"}>
                    {liveMatch.isLive ? `Room ${truncateIdentifier(liveMatch.roomId, 8, 4)}` : "Preview fallback"}
                  </span>
                </div>
              </section>

              <section className="match-rail-section">
                <p className="sidebar__eyebrow">Compact roster</p>
                <div className="match-roster-list">
                  {preview.players.map((player) => (
                    <article
                      key={player.playerId}
                      className={[
                        "match-roster-item",
                        player.isActiveTurn ? "match-roster-item--active" : "",
                        player.isCurrentPlayer ? "match-roster-item--current" : ""
                      ].join(" ").trim()}
                    >
                      <div>
                        <strong>{player.displayName}</strong>
                        <small>Tile {player.position}</small>
                      </div>
                      <div>
                        <strong>{formatCurrency(player.balance)}</strong>
                        <small>{player.ownedPropertyCount} props</small>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              {!isResultRoute ? (
                <section className="match-rail-section">
                  <p className="sidebar__eyebrow">Action cluster</p>
                  <div className="match-action-list">
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
                          className={`${variant} match-action-button`}
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
                  <p className="match-action-note">
                    {preview.actions.find((action) => action.id === pendingCommandId)?.description ?? preview.actions[0]?.description}
                  </p>
                </section>
              ) : null}
            </>
          ) : (
            <div className="match-rail-section">
              <p className="sidebar__eyebrow">Waiting</p>
              <h2>No match shell data yet</h2>
              <p>The layout is waiting for either the live room or the preview fallback.</p>
            </div>
          )}
        </aside>

        <section className="match-layout__stage">
          <Outlet />
        </section>

        <aside className="match-layout__rail match-layout__rail--right">
          {preview ? (
            <>
              {preview.connectionBanner ? (
                <section className={`match-banner match-banner--${preview.connectionBanner.tone}`}>
                  <p className="sidebar__eyebrow">Connection state</p>
                  <h2>{preview.connectionBanner.title}</h2>
                  <p>{preview.connectionBanner.detail}</p>
                </section>
              ) : null}

              <section className="match-rail-section">
                <div className="section-heading section-heading--inline">
                  <div>
                    <p className="sidebar__eyebrow">Event feed</p>
                    <h2>Recent room signals</h2>
                  </div>
                  <span className="meta-note">Filter {feedFilter}</span>
                </div>
                <div className="feed-filter-row">
                  {[
                    { id: "all", label: "All" },
                    { id: "turn", label: "Turns" },
                    { id: "payment", label: "Payments" },
                    { id: "property", label: "Property" },
                    { id: "connection", label: "Connection" }
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      className={feedFilter === filter.id ? "feed-filter-button is-active" : "feed-filter-button"}
                      onClick={() => {
                        setSelectedPanel("feed");
                        setFeedFilter(filter.id as typeof feedFilter);
                      }}
                      type="button"
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
                <div className="match-feed">
                  {filteredFeed.map((entry) => (
                    <article key={entry.id} className={`match-feed__item match-feed__item--${entry.kind}`}>
                      <div className="match-feed__meta">
                        <strong>{entry.title}</strong>
                        <small>{entry.timestampLabel}</small>
                      </div>
                      <p>{entry.detail}</p>
                    </article>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <div className="match-rail-section">
              <p className="sidebar__eyebrow">Feed unavailable</p>
              <h2>Event rail pending</h2>
              <p>Match event chrome will appear once the route resolves either a live room or a preview shell.</p>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}

export function MatchShellLayout() {
  return (
    <LiveMatchRoomProvider>
      <MatchShellFrame />
    </LiveMatchRoomProvider>
  );
}