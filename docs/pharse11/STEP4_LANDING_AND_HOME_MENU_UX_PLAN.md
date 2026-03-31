# Phase 11 - Step 4: Landing and Home/Menu UX Plan

## Planning Basis

This step is shaped by the Game Studio plugin, mainly:

- `game-studio:game-ui-frontend`
- `game-studio:web-game-foundations`

That means the landing and home/menu surfaces should feel like the front door of a browser game, not a SaaS dashboard.

They need to:

- get the player into a session quickly
- introduce the game's tone and world lightly
- keep hierarchy obvious on both desktop and mobile
- leave the denser system management screens to deeper routes rather than cramming everything into the first screen

## Objective

Define the UX direction, information hierarchy, visual language, and interaction flow for:

- landing page
- main home/menu shell after entry

## Design Intent

The product should feel like a strategic board-game club with a lively digital table, not a casino clone and not a flat admin app.

The tone should be:

- warm
- playful
- slightly theatrical
- readable and modern
- comfortable for repeat play sessions

The emotional progression should be:

1. invitation
2. confidence
3. quick entry into multiplayer flow

## Visual Direction

### Material Language

Recommended direction:

- polished tabletop atmosphere
- layered paper, card, brass, felt, and lacquer cues
- subtle geometric framing inspired by board corners and property tiles

Avoid:

- neon casino styling
- generic white-card app dashboards
- overly realistic gambling visuals

### Palette Direction

Recommended palette family:

- parchment cream / warm ivory base
- deep forest green or vintage teal structural tones
- brass or muted gold accent color
- terracotta or coral accent for urgency or call-to-action contrast

Usage rule:

- reserve the strongest contrast for the primary CTA and critical state changes
- let the background carry atmosphere through gradients and layered shapes instead of a flat page fill

### Typography Direction

Recommended typography pairing:

- expressive serif or display face for major titles and section labels
- clean humanist sans-serif for body text and actionable UI

Reason:

- this supports the board-game tone while keeping action text fast to parse

Avoid:

- default system-only aesthetic for headings
- overly decorative fonts in body copy

### Motion Tone

Recommended motion tone:

- restrained and confident
- cards slide and settle, not bounce continuously
- CTA and menu transitions should feel tactile, like panels being placed on a game table

Use stronger motion only for:

- first load reveal
- important CTA emphasis
- room start / transfer transitions later

## Landing Page Purpose

The landing page should do only three jobs.

### Job 1 - Explain the Fantasy Quickly

The player should understand within a few seconds:

- this is a multiplayer Monopoly-style board game
- it supports 4-6 players
- it is built for live browser play

### Job 2 - Offer a Clear Primary Entry

The page should push one dominant action:

- `Play Now`

Supporting actions can exist, but they should not compete equally with the primary CTA.

### Job 3 - Build Trust in the Product Loop

The page should communicate:

- real-time multiplayer
- persistent match history
- leaderboard/stat progression
- classic board foundation with modern presentation

## Landing Page Information Hierarchy

Recommended vertical order:

1. hero section
2. quick feature proof strip
3. main action cluster
4. social proof or game-loop summary
5. secondary navigation to leaderboard/history

### Hero Section

Must include:

- clear title
- one-sentence product pitch
- primary CTA
- one supporting CTA

Recommended supporting CTA:

- `View Leaderboard`

### Quick Feature Proof Strip

Recommended chips/cards:

- `4-6 Players`
- `Classic 40-Tile Board`
- `Live Room Play`
- `Persistent Match History`

### Game-Loop Summary Section

Recommended content:

- create or join lobby
- ready up with friends
- host starts match
- play live turns
- review results and match history

This should stay compact. The landing page is not the place for a giant rules document.

## Home/Menu Shell Purpose

The `/play` screen is the player's control hub.

It should feel like a concise staging area between the landing page and deeper game routes.

It should do four jobs.

### Job 1 - Offer Fast Access to the Primary Multiplayer Flow

The strongest action on the screen should still be:

- `Browse Lobbies`

### Job 2 - Expose Durable Meta Surfaces

The home/menu shell should give fast access to:

- leaderboard
- match history

### Job 3 - Surface Session Continuity

If reconnect metadata exists later, this screen should have space for:

- `Resume Match`
- `Return to Lobby`

### Job 4 - Act as a Lightweight Hub, Not a Data Dump

The screen should not try to show every table, every stat, every log, and every panel at once.

## Home/Menu Information Hierarchy

Recommended structure:

### Primary Action Zone

Contains:

- `Browse Lobbies`
- `Create/Join Lobby`

This zone should be visually strongest.

### Session Continuity Zone

Contains when relevant:

- recent or reconnectable session card
- status line such as `Match in progress` or `Lobby waiting`

This zone should appear only when useful, not as empty chrome.

### Meta Navigation Zone

Contains:

- `Leaderboard`
- `Match History`

This can be more compact than the primary action zone.

### Lightweight Preview Zone

Optional content:

- top leaderboard snippet
- recent match snippet
- short activity preview

Rule:

- previews should tease, not replace the dedicated pages
- do not turn `/play` into a dense analytics screen

## Recommended Layout Direction

### Landing Layout

Desktop:

- large hero on top
- one strong CTA cluster
- supporting proof row beneath
- one or two secondary sections only

Mobile:

- hero compresses into a single readable stack
- CTA stays above the fold
- proof chips become scroll or compact stack

### Home/Menu Layout

Desktop:

- one dominant central or left-weighted action panel
- one smaller side cluster for leaderboard/history links or session continuity
- avoid equal-weight grid cards across the whole screen

Mobile:

- narrow vertical stack
- primary multiplayer action stays first
- continuity card second if relevant
- meta links below

## Recommended Component Families

### Landing Components

- hero banner
- CTA button pair
- feature chip row
- compact game-loop explainer cards
- subtle decorative board-inspired background layers

### Home/Menu Components

- primary action card
- session continuity card
- leaderboard preview card
- match history preview card
- compact navigation rail or cluster

## Copy Tone Guidance

Use copy that is:

- direct
- welcoming
- slightly game-like without sounding cheesy

Examples of tone:

- `Seat your crew and start the next match.`
- `Browse live rooms, ready up, and take the board.`
- `Review standings, recent matches, and unfinished sessions.`

Avoid copy that feels:

- corporate
- casino-promotional
- overloaded with rules text

## CTA Hierarchy Rules

### Landing Page

Primary CTA:

- `Play Now`

Secondary CTA:

- `View Leaderboard` or `See Match History`

### Home/Menu

Primary CTA:

- `Browse Lobbies`

Secondary actions:

- `Create or Join Lobby`
- `Leaderboard`
- `Match History`

Conditional CTA:

- `Resume Match`

Rule:

- if `Resume Match` exists, it may become the visually dominant action for that returning player

## Anti-Patterns To Avoid

- equal-weight dashboard cards covering the whole first screen
- giant generic app navbar as the main visual identity
- rules text blocks in the hero
- more than two competing CTAs in the landing hero
- oversized always-on panels for leaderboard and history on `/play`
- cold, sterile white-and-blue product styling
- over-animated floating widgets and constant motion noise

## Accessibility and Readability Rules

- CTA labels must be immediately understandable
- heading contrast must stay high over decorative backgrounds
- cards and overlays should keep readable backing treatment
- mobile tap targets must be comfortable without making the layout feel toy-like
- any motion used for entrance or hover states should remain non-essential

## Step 4 Decisions Locked

This step locks the following decisions for Phase 11:

- landing page uses one dominant primary CTA and one supporting CTA
- `/play` is a lightweight hub, not a metrics dashboard
- the visual language should evoke a polished tabletop game space
- persistent information density must stay low on first-load screens
- session continuity is conditional and should not create empty placeholder chrome

## Expected Next Step

The next step is:

- `Phase 11 - Step 5: Lobby and Room UI Plan`