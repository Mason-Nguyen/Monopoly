# Phase 2 - Step 5: Board Configuration Model

## Objective

Define a data-driven configuration model for the classic 40-tile board so the frontend, Colyseus room state, and rules engine can all rely on the same board definition.

This step specifies the shape of board config data, tile config data, and property config data for the MVP.

## Design Principles

- Board layout should be defined by data, not hardcoded room logic
- Static board configuration must be separate from dynamic ownership state
- The config must support both frontend rendering and backend rule resolution
- The classic 40-tile loop must remain stable even if advanced systems are deferred
- Deferred tile systems can be represented in MVP without forcing full rules support yet

## Recommended Board Modeling Split

Separate board concerns into two layers:

### Layer 1 - Static Board Configuration

Defines:

- tile positions
- tile names
- tile categories
- tile-linked property definitions
- tax amounts
- jail target links
- render metadata if needed later

This data should be immutable during a match.

### Layer 2 - Dynamic Match State

Defines:

- who owns which property
- current player positions
- turn resolution state

This data lives in `MonopolyRoomState`.

## Recommended Files or Sources Later

The board should eventually be loaded from configuration such as:

- `board.config.ts`
- `board.config.json`
- seeded data source generated at build time

Recommended MVP approach:

- keep board config in code or a static JSON file first
- do not store the board layout in PostgreSQL unless later tooling needs it

Reason:

- the board is product configuration, not user-generated data
- code-based config is simpler and more versionable early on

## Recommended Top-Level Board Config Shape

Suggested structure:

```ts
interface BoardConfig {
  boardId: string;
  name: string;
  tileCount: number;
  startSalary: number;
  startingMoney: number;
  tiles: TileConfig[];
  properties: PropertyConfig[];
}
```

### Field Purpose

#### `boardId`

- stable identifier for the board definition

#### `name`

- human-readable board name

#### `tileCount`

- should be `40` for the classic MVP board

#### `startSalary`

- MVP rule constant set to `200`

#### `startingMoney`

- MVP rule constant set to `1500`

#### `tiles`

- ordered tile definitions for all 40 positions

#### `properties`

- property definitions referenced by tile config

## Recommended `TileConfig` Shape

Suggested structure:

```ts
interface TileConfig {
  tileIndex: number;
  key: string;
  name: string;
  tileType: TileType;
  propertyId?: string;
  taxAmount?: number;
  targetTileIndex?: number;
}
```

### Field Purpose

#### `tileIndex`

- the canonical board position from `0` to `39`

#### `key`

- stable programmatic identifier for the tile
- useful for logging, analytics, and frontend asset mapping

#### `name`

- player-facing tile label

#### `tileType`

Suggested MVP values:

- `start`
- `property`
- `tax`
- `jail`
- `go_to_jail`
- `free_parking`
- `neutral`

#### `propertyId`

- present only when tile type is `property`

#### `taxAmount`

- present only when tile type is `tax`

#### `targetTileIndex`

- present only when tile type uses forced movement such as `go_to_jail`

## Recommended `PropertyConfig` Shape

Suggested structure:

```ts
interface PropertyConfig {
  propertyId: string;
  tileIndex: number;
  key: string;
  name: string;
  purchasePrice: number;
  rentAmount: number;
  colorGroup?: string;
}
```

### Field Purpose

#### `propertyId`

- stable identifier for property ownership tracking

#### `tileIndex`

- links property to board position

#### `key`

- stable programmatic identifier for frontend and logs

#### `name`

- player-facing label

#### `purchasePrice`

- fixed MVP buy price

#### `rentAmount`

- fixed MVP rent amount

#### `colorGroup`

- optional in MVP
- may be included now for future extension, even if color-set bonus is disabled

Reason:

- including `colorGroup` early is low-risk and future-friendly
- rules may ignore it until a later phase

## TileType Mapping for Classic 40-Tile Board

The board must contain exactly 40 tile entries.

However, not every classic Monopoly tile needs full classic behavior in MVP.

### Recommended Mapping Strategy

Map classic positions into MVP tile types as follows:

- classic `GO` -> `start`
- classic properties -> `property`
- classic income tax / luxury tax -> `tax`
- classic jail tile -> `jail`
- classic go to jail tile -> `go_to_jail`
- classic free parking -> `free_parking`
- classic chance/community chest/railroad/utility positions -> either `neutral` or simplified `property`, depending on chosen MVP board flavor

## Recommended MVP Mapping Choice

Use this simple rule for the first implementation:

- keep true property spaces as `property`
- keep tax, jail, go to jail, free parking, and start as dedicated tile types
- map chance, community chest, utilities, and railroads to `neutral` in MVP unless you explicitly want to simplify some of them into regular properties later

Reason:

- this preserves the classic 40-tile layout
- it avoids hidden behavior on unsupported systems
- it keeps the rules engine small and honest about MVP scope

## Optional Alternative Mapping

If later you want a denser property economy without adding more rules, you could map:

- railroads -> simplified `property`
- utilities -> simplified `property`

Current recommendation:

- do not do this in the initial MVP config unless you deliberately want to rebalance the board around more purchasable tiles

## Required Board Validation Rules

The board config should pass these checks:

- `tileCount === 40`
- tiles cover every `tileIndex` from `0` through `39`
- no duplicate `tileIndex`
- every `property` tile references a valid `propertyId`
- every `PropertyConfig.tileIndex` references a tile whose type is `property`
- every `propertyId` is unique
- every `targetTileIndex` points to a valid tile index
- there is exactly one `start` tile
- there is exactly one `jail` tile
- there is exactly one `go_to_jail` tile
- there is exactly one `free_parking` tile

Reason:

- these validations will prevent subtle gameplay bugs early

## Recommended Static Versus Dynamic Fields

### Static Board Config Fields

These belong in immutable board config:

- tile names
- tile order
- tile types
- tax amounts
- property prices
- property rent amounts
- target tile references
- color group metadata if included

### Dynamic Match Fields

These must not be stored in board config:

- owner player ID
- current balance changes
- current player positions
- turn phase
- bankruptcy state
- abandonment state

Reason:

- board config should be reusable across all matches
- ownership and player state belong to room state

## Recommended Relationship Between Config and Room State

During match initialization:

- load `BoardConfig`
- copy or reference static tile data into `BoardState`
- initialize dynamic `PropertyState` ownership using the property definitions from config
- set all owners to `null`

This allows:

- static config reuse
- dynamic ownership tracking per match
- easy reset for new matches

## Suggested Initial Classic 40-Tile Category Layout

The exact names can be finalized later, but the shape should resemble:

- tile `0` -> `start`
- one `jail` position
- one `go_to_jail` position
- one `free_parking` position
- two `tax` positions
- multiple `property` positions
- remaining unsupported classic positions -> `neutral`

This preserves the classic board loop while keeping MVP rules manageable.

## Suggested Future-Ready Extensions

The config model should be compatible with future expansion such as:

- `cardDeckType` for chance/community chest
- `utilityRuleType`
- `railroadRuleType`
- `mortgageValue`
- `buildCost`
- `houseRentTable`
- `hotelRent`
- tile visual theme metadata

These should not be required in MVP.

## Suggested Shared Types to Create Later

Phase 2 should later create shared types for:

- `BoardConfig`
- `TileConfig`
- `PropertyConfig`
- `TileType`

## Step 5 Deliverables

This step should produce:

- a top-level board config shape
- a tile config shape
- a property config shape
- classic 40-tile mapping guidance for MVP
- config validation rules
- a clean split between static config and dynamic match state

## Exit Criteria

Step 5 is complete when:

- the classic board can be represented entirely by data
- tile and property config shape are explicit
- dynamic ownership is clearly separated from static board definition
- Phase 2 sign-off can freeze the modeling baseline without board ambiguity
