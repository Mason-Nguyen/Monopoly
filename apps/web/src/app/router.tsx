import { Suspense, lazy, type ReactNode } from "react";
import {
  Link,
  NavLink,
  Outlet,
  RouterProvider,
  createBrowserRouter
} from "react-router-dom";
import { truncateIdentifier } from "../services";
import { useSessionStore, useUiStore } from "../stores";

const LandingPage = lazy(async () => ({ default: (await import("../pages/landing-page")).LandingPage }));
const PlayHomePage = lazy(async () => ({ default: (await import("../pages/play-home-page")).PlayHomePage }));
const LeaderboardPage = lazy(async () => ({ default: (await import("../pages/leaderboard-page")).LeaderboardPage }));
const MatchesPage = lazy(async () => ({ default: (await import("../pages/matches-page")).MatchesPage }));
const MatchDetailPage = lazy(async () => ({ default: (await import("../pages/match-detail-page")).MatchDetailPage }));
const LobbiesPage = lazy(async () => ({ default: (await import("../pages/lobbies-page")).LobbiesPage }));
const LobbyRoomPage = lazy(async () => ({ default: (await import("../pages/lobby-room-page")).LobbyRoomPage }));
const MatchRoomPage = lazy(async () => ({ default: (await import("../pages/match-room-page")).MatchRoomPage }));
const MatchResultPage = lazy(async () => ({ default: (await import("../pages/match-result-page")).MatchResultPage }));
const NotFoundPage = lazy(async () => ({ default: (await import("../pages/not-found-page")).NotFoundPage }));
const MatchShellLayout = lazy(async () => ({ default: (await import("../features/match/match-shell-layout")).MatchShellLayout }));

const appNavigation = [
  { label: "Play", to: "/play" },
  { label: "Lobbies", to: "/lobbies" },
  { label: "Leaderboard", to: "/leaderboard" },
  { label: "Matches", to: "/matches" }
];

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

function RouteLoadingFallback({ title, detail }: { title: string; detail: string }) {
  return (
    <section className="surface-card surface-card--soft route-loading-card">
      <p className="eyebrow">Loading route</p>
      <h2>{title}</h2>
      <p>{detail}</p>
    </section>
  );
}

function withRouteSuspense(node: ReactNode, fallback: ReactNode) {
  return <Suspense fallback={fallback}>{node}</Suspense>;
}

function MarketingLayout() {
  return (
    <div className="site-shell marketing-layout">
      <header className="topbar topbar--marketing">
        <Wordmark />
        <nav className="topbar__links" aria-label="Marketing navigation">
          <Link to="/leaderboard">Leaderboard</Link>
          <Link to="/matches">Match History</Link>
          <Link to="/play">Play</Link>
        </nav>
      </header>
      <main className="marketing-main">
        <Outlet />
      </main>
    </div>
  );
}

function AppShellLayout() {
  const displayName = useSessionStore((state) => state.displayName);
  const playerId = useSessionStore((state) => state.playerId);
  const isNavOpen = useUiStore((state) => state.isPrimaryNavOpen);
  const toggleNav = useUiStore((state) => state.togglePrimaryNav);
  const closeNav = useUiStore((state) => state.closePrimaryNav);

  return (
    <div className="site-shell app-layout">
      <header className="topbar topbar--app">
        <div className="topbar__group">
          <button
            aria-expanded={isNavOpen}
            aria-label="Toggle navigation"
            className="nav-toggle"
            onClick={toggleNav}
            type="button"
          >
            Menu
          </button>
          <Wordmark />
        </div>
        <div className="topbar__status">
          <span className="status-chip status-chip--soft">
            {displayName.length > 0 ? displayName : "Choose your table name"}
          </span>
          <span className="status-chip status-chip--ghost">
            {playerId ? `guest ${truncateIdentifier(playerId, 6, 4)}` : "guest session not set"}
          </span>
        </div>
      </header>

      <div className="app-layout__body">
        <aside className={`app-sidebar${isNavOpen ? " is-open" : ""}`}>
          <p className="sidebar__eyebrow">Phase 11 shell</p>
          <nav className="sidebar__nav" aria-label="App navigation">
            {appNavigation.map((item) => (
              <NavLink
                key={item.to}
                className={({ isActive }) =>
                  isActive ? "sidebar__link sidebar__link--active" : "sidebar__link"
                }
                onClick={closeNav}
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="sidebar__footnote">
            <p>DOM-first app shell now drives the functional frontend.</p>
            <p>Phase 12 will plug the 2.5D board into the reserved match playfield.</p>
          </div>
        </aside>

        <main className="shell-stage">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const router = createBrowserRouter([
  {
    element: <MarketingLayout />,
    path: "/",
    children: [
      {
        index: true,
        element: withRouteSuspense(
          <LandingPage />,
          <RouteLoadingFallback title="Preparing landing table" detail="The product shell is warming up the tabletop intro." />
        )
      }
    ]
  },
  {
    element: <AppShellLayout />,
    children: [
      {
        path: "/play",
        element: withRouteSuspense(
          <PlayHomePage />,
          <RouteLoadingFallback title="Opening your table hub" detail="Loading the menu, continuity panel, and entry actions." />
        )
      },
      {
        path: "/leaderboard",
        element: withRouteSuspense(
          <LeaderboardPage />,
          <RouteLoadingFallback title="Loading leaderboard" detail="Fetching the standings surface for durable player stats." />
        )
      },
      {
        path: "/matches",
        element: withRouteSuspense(
          <MatchesPage />,
          <RouteLoadingFallback title="Loading match history" detail="Opening the persisted match timeline and history list." />
        )
      },
      {
        path: "/matches/:matchId",
        element: withRouteSuspense(
          <MatchDetailPage />,
          <RouteLoadingFallback title="Loading match detail" detail="Preparing the durable match detail surface." />
        )
      },
      {
        path: "/lobbies",
        element: withRouteSuspense(
          <LobbiesPage />,
          <RouteLoadingFallback title="Loading lobbies" detail="Preparing the lobby browser and live room entry points." />
        )
      },
      {
        path: "/lobbies/:lobbyId",
        element: withRouteSuspense(
          <LobbyRoomPage />,
          <RouteLoadingFallback title="Opening lobby room" detail="Connecting the pre-match route to live or preview room state." />
        )
      }
    ]
  },
  {
    element: withRouteSuspense(
      <MatchShellLayout />,
      <RouteLoadingFallback title="Preparing live match shell" detail="Loading the HUD rails, live room provider, and match route chrome." />
    ),
    children: [
      {
        path: "/match/:matchId",
        element: withRouteSuspense(
          <MatchRoomPage />,
          <RouteLoadingFallback title="Opening match stage" detail="Preparing the live match stage and board-window placeholder." />
        )
      },
      {
        path: "/match/:matchId/result",
        element: withRouteSuspense(
          <MatchResultPage />,
          <RouteLoadingFallback title="Opening result handoff" detail="Loading the finished-match handoff surface." />
        )
      }
    ]
  },
  {
    path: "*",
    element: withRouteSuspense(
      <NotFoundPage />,
      <RouteLoadingFallback title="Resolving route" detail="Checking the requested route inside the frontend shell." />
    )
  }
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}