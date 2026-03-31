import { CLASSIC_BOARD_CONFIG, MVP_MAX_PLAYERS, MVP_MIN_PLAYERS } from "@monopoly/shared-config";
import { Link } from "react-router-dom";

const featureChips = [
  `${MVP_MIN_PLAYERS}-${MVP_MAX_PLAYERS} live players`,
  `${CLASSIC_BOARD_CONFIG.tileCount} classic board spaces`,
  `${CLASSIC_BOARD_CONFIG.properties.length} purchasable properties`,
  "Authoritative Colyseus rooms"
];

const gameLoop = [
  {
    title: "Form the table",
    description: "Browse or create a lobby, ready up with your crew, and let the host start the room."
  },
  {
    title: "Take live turns",
    description: "Roll, buy, pay, and survive through authoritative turn flow with reconnect-safe multiplayer."
  },
  {
    title: "Review the aftermath",
    description: "Track standings, match history, and durable results once the game settles."
  }
];

const boardStats = [
  {
    label: "Board",
    value: CLASSIC_BOARD_CONFIG.name
  },
  {
    label: "Salary on GO",
    value: `$${CLASSIC_BOARD_CONFIG.startSalary}`
  },
  {
    label: "Starting bankroll",
    value: `$${CLASSIC_BOARD_CONFIG.startingMoney}`
  }
];

const showcaseTiles = CLASSIC_BOARD_CONFIG.tiles.slice(0, 6);

export function LandingPage() {
  return (
    <div className="landing-page">
      <section className="hero-panel hero-panel--split">
        <div className="hero-panel__copy">
          <p className="eyebrow">Live tabletop strategy for the browser</p>
          <h1>Seat your crew and take the board.</h1>
          <p className="lead">
            Monopoly Table is a warm, real-time browser game where 4-6 players race through a
            classic property board with authoritative rooms, durable match history, and a frontend
            built to stay playable as the 2.5D scene arrives.
          </p>
          <div className="cta-row">
            <Link className="button button--primary" to="/play">
              Play Now
            </Link>
            <Link className="button button--ghost" to="/leaderboard">
              View Leaderboard
            </Link>
          </div>
          <div className="chip-row" aria-label="Core product facts">
            {featureChips.map((chip) => (
              <span key={chip} className="chip">
                {chip}
              </span>
            ))}
          </div>
        </div>

        <aside className="hero-panel__aside">
          <div className="showcase-card showcase-card--dark">
            <p className="eyebrow">Tonight's table</p>
            <h2>Classic board, modern room flow</h2>
            <ul className="stat-list">
              {boardStats.map((item) => (
                <li key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </li>
              ))}
            </ul>
          </div>
          <div className="showcase-grid">
            {showcaseTiles.map((tile) => (
              <article key={tile.tileIndex} className={`tile-preview tile-preview--${tile.tileType}`}>
                <span>#{tile.tileIndex}</span>
                <strong>{tile.name}</strong>
                <small>{tile.tileType}</small>
              </article>
            ))}
          </div>
        </aside>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <p className="eyebrow">Why it works</p>
          <h2>A sharper flow than a static board clone</h2>
        </div>
        <div className="info-grid">
          {gameLoop.map((step, index) => (
            <article key={step.title} className="info-card">
              <span className="info-card__index">0{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block section-block--narrow">
        <div className="banner-card">
          <div>
            <p className="eyebrow">Fast entry</p>
            <h2>Jump into the app shell, then decide how competitive you feel.</h2>
            <p>
              Browse active rooms, inspect the leaderboard, or study recent matches before you sit
              down for the next live session.
            </p>
          </div>
          <div className="cta-stack">
            <Link className="button button--primary" to="/play">
              Open Menu Hub
            </Link>
            <Link className="button button--ghost" to="/matches">
              See Match History
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}