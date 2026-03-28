import { CLASSIC_BOARD_CONFIG, MVP_MAX_PLAYERS, MVP_MIN_PLAYERS } from "@monopoly/shared-config";
import type { TileConfig } from "@monopoly/shared-types";

const coreFeatures = [
  "Host-controlled lobby start",
  "Classic 40-tile board",
  "Colyseus authoritative rooms",
  "PostgreSQL-backed app services"
];

const foundationChecks = [
  `${MVP_MIN_PLAYERS}-${MVP_MAX_PLAYERS} players per production match`,
  `${CLASSIC_BOARD_CONFIG.properties.length} purchasable properties in MVP`,
  `${CLASSIC_BOARD_CONFIG.tileCount} board positions scaffolded`,
  `${CLASSIC_BOARD_CONFIG.startSalary} salary when passing GO`
];

const previewTiles: TileConfig[] = CLASSIC_BOARD_CONFIG.tiles.slice(0, 8);

export function App() {
  return (
    <div className="app-shell">
      <header className="hero">
        <p className="eyebrow">Phase 3 / Step 4</p>
        <h1>Monopoly Web Runtime Setup</h1>
        <p className="lede">
          The frontend runtime is now scaffolded with Vite and React, ready for the lobby,
          board scene, and gameplay HUD to grow on top of a real app shell.
        </p>
      </header>

      <main className="layout">
        <section className="panel">
          <h2>Core Stack</h2>
          <ul className="bullet-list">
            {coreFeatures.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </section>

        <section className="panel accent-panel">
          <h2>Scaffold Snapshot</h2>
          <ul className="bullet-list compact">
            {foundationChecks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="panel grid-span-2">
          <div className="section-header">
            <h2>Board Preview</h2>
            <span>{CLASSIC_BOARD_CONFIG.name}</span>
          </div>
          <div className="tile-grid">
            {previewTiles.map((tile) => (
              <article key={tile.tileIndex} className={`tile-card tile-${tile.tileType}`}>
                <span className="tile-index">#{tile.tileIndex}</span>
                <strong>{tile.name}</strong>
                <span>{tile.tileType}</span>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}