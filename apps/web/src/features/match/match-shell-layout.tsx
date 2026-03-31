import { Outlet, useLocation, useParams } from "react-router-dom";
import { formatCurrency } from "../../lib";
import { truncateIdentifier, useMatchShellPreviewQuery } from "../../services";
import { useMatchUiStore, useSessionStore } from "../../stores";
import { LiveMatchRoomProvider, useLiveMatchRoom } from "./live-match-room-context";

function formatRosterStatusLabel(
  player: {
    isActiveTurn: boolean;
    isCurrentPlayer: boolean;
    status: "active" | "waiting" | "reconnect_reserved";
    position: number;
  }
) {
  if (player.isActiveTurn) {
    return "Turn";
  }

  if (player.status === "reconnect_reserved") {
    return "Rejoin";
  }

  if (player.isCurrentPlayer) {
    return "You";
  }

  return `Tile ${player.position}`;
}

function MatchShellFrame() {
  const { matchId } = useParams();
  const location = useLocation();
  const playerId = useSessionStore((state) => state.playerId);
  const displayName = useSessionStore((state) => state.displayName);
  const selectedPanel = useMatchUiStore((state) => state.selectedPanel);
  const feedFilter = useMatchUiStore((state) => state.feedFilter);
  const isRightRailOpen = useMatchUiStore((state) => state.isRightRailOpen);
  const setSelectedPanel = useMatchUiStore((state) => state.setSelectedPanel);
  const setFeedFilter = useMatchUiStore((state) => state.setFeedFilter);
  const setRightRailOpen = useMatchUiStore((state) => state.setRightRailOpen);
  const toggleRightRail = useMatchUiStore((state) => state.toggleRightRail);
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
  const visibleBanner = preview?.connectionBanner?.tone === "warn" ? preview.connectionBanner : null;

  return (
    <div className="site-shell match-layout match-layout--no-header">
      <main className="match-layout__main match-layout__main--playfield">
        <aside className="match-layout__rail match-layout__rail--thin">
          {liveMatch.status === "connecting" && !preview ? (
            <div className="match-rail-section match-rail-section--tight">
              <p className="sidebar__eyebrow">Connecting</p>
              <p>Preparing table</p>
            </div>
          ) : previewQuery.isError && !preview ? (
            <div className="match-rail-section match-rail-section--tight">
              <p className="sidebar__eyebrow">Unavailable</p>
              <p>{previewQuery.error instanceof Error ? previewQuery.error.message : "Unexpected preview error."}</p>
            </div>
          ) : preview ? (
            <>
              <section className="match-rail-section match-rail-section--tight">
                <p className="sidebar__eyebrow">Seats</p>
                <div className="match-roster-list match-roster-list--thin">
                  {preview.players.map((player) => (
                    <article
                      key={player.playerId}
                      className={[
                        "match-roster-item",
                        "match-roster-item--thin",
                        player.isActiveTurn ? "match-roster-item--active" : "",
                        player.isCurrentPlayer ? "match-roster-item--current" : ""
                      ].join(" ").trim()}
                    >
                      <div>
                        <strong>{player.displayName}</strong>
                        <small>{formatRosterStatusLabel(player)}</small>
                      </div>
                      <span className="match-roster-item__balance">{formatCurrency(player.balance)}</span>
                    </article>
                  ))}
                </div>
              </section>
              <section className="match-rail-section match-rail-section--muted match-rail-section--tight">
                <p className="sidebar__eyebrow">Mode</p>
                <p>{liveMatch.isLive ? `Live ${truncateIdentifier(liveMatch.roomId, 8, 4)}` : "Preview fallback"}</p>
              </section>
            </>
          ) : (
            <div className="match-rail-section match-rail-section--tight">
              <p className="sidebar__eyebrow">Waiting</p>
              <p>No roster yet</p>
            </div>
          )}
        </aside>

        <section className="match-layout__playfield-shell">
          {visibleBanner ? (
            <section className="match-banner match-banner--warn match-stage-banner">
              <p className="sidebar__eyebrow">Reconnect notice</p>
              <h2>{visibleBanner.title}</h2>
              <p>{visibleBanner.detail}</p>
            </section>
          ) : null}

          <div className="match-layout__stage-frame">
            {!isResultRoute && preview ? (
              <>
                <button
                  className={isRightRailOpen ? "match-rail-toggle is-open" : "match-rail-toggle"}
                  onClick={() => {
                    setSelectedPanel(selectedPanel === "economy" ? "economy" : "feed");
                    toggleRightRail();
                  }}
                  type="button"
                >
                  {isRightRailOpen ? "Hide Feed & Economy" : "Feed & Economy"}
                </button>

                <aside className={isRightRailOpen ? "match-layout__rail-drawer is-open" : "match-layout__rail-drawer"}>
                  <div className="match-layout__rail-drawer-header">
                    <div>
                      <p className="sidebar__eyebrow">Right rail</p>
                      <h2>{selectedPanel === "economy" ? "Economy" : "Event Feed"}</h2>
                    </div>
                    <button
                      className="feed-filter-button"
                      onClick={() => {
                        setRightRailOpen(false);
                      }}
                      type="button"
                    >
                      Close
                    </button>
                  </div>

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
                            setRightRailOpen(true);
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

                  <section className="match-rail-section">
                    <div className="section-heading">
                      <p className="sidebar__eyebrow">Economy mini-card</p>
                      <h2>{preview.currentTileName}</h2>
                    </div>
                    <article className="economy-mini-card">
                      <div>
                        <span>Local cash</span>
                        <strong>{formatCurrency(preview.economy.localBalance)}</strong>
                      </div>
                      <div>
                        <span>Tile type</span>
                        <strong>{preview.currentTileType}</strong>
                      </div>
                      <div>
                        <span>Next buy</span>
                        <strong>{preview.economy.nextBuyOpportunity}</strong>
                      </div>
                      <div>
                        <span>Cost</span>
                        <strong>
                          {preview.economy.nextBuyCost !== null
                            ? formatCurrency(preview.economy.nextBuyCost)
                            : "-"}
                        </strong>
                      </div>
                    </article>
                  </section>
                </aside>
              </>
            ) : null}

            <Outlet />
          </div>
        </section>
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