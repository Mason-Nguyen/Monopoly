# Step 4 - Tile and Economy Rules

## Objective

Define the MVP economy rules, tile behavior, and simplified jail/payment rules so the game engine can be modeled without ambiguity.

This step locks the minimum financial and board logic needed for a playable first version.

## Design Direction

The MVP should use familiar Monopoly-like economy rules, but remove systems that create too many branching cases.

For the first playable version:

- money flow should be easy to understand
- tile resolution should be mostly automatic
- only core property ownership is supported
- all optional advanced economy systems are deferred
- the board layout is classic, but the rule set is simplified

## Recommended MVP Economy Model

Use a simplified Monopoly economy with:

- one shared starting balance for all players
- salary reward for passing or landing on Start
- purchasable standard properties only
- fixed rent values per property
- automatic tax deduction
- simplified jail penalty
- immediate bankruptcy when a mandatory payment cannot be made

## Confirmed Economic Constants for MVP

### Starting Money

Decision:

- each player starts with `1500`

### Salary for Start

Decision:

- a player receives `200` when passing or landing on `Start`

### Tax Amounts

Decision:

- tax tiles use fixed values defined by the board configuration
- MVP should use only simple fixed tax amounts such as `100` or `200`

## Board Scope for MVP

Decision:

- MVP uses the classic Monopoly-style board with `40` tiles
- the visual board layout should map to the classic full loop
- the gameplay systems remain simplified for the first playable version

Reason:

- this keeps the board familiar to players
- it preserves the long-form board identity of Monopoly
- it allows future expansion without changing the board structure later

## Tile Categories for MVP

The classic 40-tile board in MVP should use only the following active tile categories:

- `start`
- `property`
- `tax`
- `jail`
- `go_to_jail`
- `free_parking`
- `neutral`

Note:

- the board is classic in size and loop structure
- advanced tile systems such as utilities, railroads, and card decks are deferred for now
- those positions may temporarily behave as `neutral` or simplified `property` tiles depending on board design in Phase 2

## Tile Behavior Rules

### `start`

Behavior:

- landing on or passing `start` grants the player `200`
- no manual action is required
- the server resolves this automatically during movement

### `property`

Behavior:

- if the property is unowned, the active player may buy it
- if the property is owned by another player, rent is paid automatically
- if the property is owned by the active player, nothing happens

MVP simplification:

- all purchasable tiles use the same property rule shape
- no special railroad or utility rules
- no house or hotel upgrades
- no color-set bonus required in MVP

### `tax`

Behavior:

- the active player automatically pays the fixed tax amount
- if the player cannot pay, bankruptcy rules apply

### `jail`

Behavior:

- this is the jail location tile
- landing here normally does not punish the player by itself unless the player was sent to jail
- it mainly acts as the place where jailed players stay

### `go_to_jail`

Behavior:

- the active player is moved immediately to the jail tile
- the player does not collect `200` from Start during this forced move
- the player's jail state becomes active
- the turn then proceeds according to jail rules

### `free_parking`

Behavior:

- no bonus effect in MVP
- landing here has no financial or action effect

### `neutral`

Behavior:

- no effect
- used for classic-board positions that are present in layout but not yet given advanced systems in MVP

## Property Model for MVP

Each property should contain at least:

- `id`
- `name`
- `purchasePrice`
- `rentAmount`
- `ownerPlayerId` or empty owner state
- `boardPosition`

MVP simplification:

- no mortgage value
- no upgrade level
- no building count
- no grouped ownership bonus logic required yet

## Rent Rules for MVP

Rent should follow these rules:

- each property has one fixed rent amount
- if a player lands on another player's property, rent is paid automatically
- if the player cannot pay full rent, bankruptcy is triggered immediately
- partial payment is not supported in MVP
- rent does not scale with houses, hotels, utilities, or dice result

## Property Purchase Rules for MVP

A property purchase is valid only if:

- the tile is a property
- the property is unowned
- the active player is in the correct turn phase
- the player has enough balance to pay full price

If the player buys the property:

- property ownership is assigned to the player
- the purchase price is deducted immediately
- the turn continues toward end-turn state

If the player skips purchase:

- the property remains unowned
- auction logic is not used in MVP
- the player may end the turn

## Bankruptcy Rules for MVP

A player becomes bankrupt when:

- the player must pay a mandatory amount
- the player does not have enough money to pay in full

Mandatory payments include:

- rent
- tax
- any other forced financial rule added later in MVP

When bankruptcy happens:

- the player is eliminated from active play
- the player's remaining balance becomes `0`
- all owned properties return to the bank as unowned properties
- the player is removed from future turn rotation

## Jail Rules for MVP

The MVP jail system should be intentionally simple.

### When a Player Enters Jail

A player enters jail when:

- the player lands on `go_to_jail`
- a later MVP rule explicitly sends the player to jail

Effects:

- the player is moved to the jail tile
- the player's jail state becomes active
- the current turn ends after jail processing completes

### Jail Duration

Decision:

- a jailed player skips exactly `1` full turn
- at the start of the following turn, the player is automatically released

### Jail Release

When release occurs:

- the player's jail state is cleared by the server
- the player begins the next turn normally at `await_roll`

Deferred systems:

- pay fine to leave jail
- roll doubles to leave jail
- get out of jail cards

## Passing Start Rule

The server should award the `200` salary when:

- a normal move passes the start position
- a normal move lands directly on start

The server should not award the salary when:

- a player is moved directly to jail by `go_to_jail`
- any future forced relocation rule explicitly says no salary is granted

## Economy Systems Deferred Beyond MVP

The following economy systems are excluded from MVP:

- auctions
- trading
- mortgage
- selling property
- houses and hotels
- monopoly color bonuses
- utilities with dice-based rent
- railroads with count-based rent
- debt negotiation
- partial payment flow
- bankruptcy asset transfer to creditors

## Board Configuration Guidance for Later Phases

Phase 2 and later should keep the classic board config data-driven.

Each tile should be definable through configuration with:

- tile type
- title
- board position
- purchase price if applicable
- rent amount if applicable
- tax amount if applicable
- jail target position if applicable

Reason:

- this allows the classic 40-tile board to stay stable while rules expand later
- it supports adding deferred systems without reshaping the board

## Step 4 Deliverables

This step should produce:

- exact starting money
- exact start salary rule
- classic 40-tile board decision
- exact tile categories for MVP
- property and rent baseline
- bankruptcy baseline
- simplified jail rule
- explicit list of deferred economy systems

## Exit Criteria

Step 4 is complete when:

- the engine can resolve all MVP tile types
- the money flow is explicit
- the bankruptcy rule is explicit
- the jail rule is explicit
- no major economy ambiguity remains for Phase 2

## Notes for Later Steps

- Step 5 will finalize disconnect and reconnect behavior during live matches
- Phase 2 will turn these rules into state shapes, enums, and command contracts
