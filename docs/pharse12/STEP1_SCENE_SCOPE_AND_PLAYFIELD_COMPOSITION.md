# Step 1 - Scene Scope and Playfield Composition

## Status

- Approved
- Implemented
- Verified

## Approval Outcome

The approved layout direction for Step 1 is:

- `left rail` stays thin and roster-focused
- a compact `turn chip` stays visible at the top edge
- a `reconnect banner` appears only when lifecycle state needs attention
- the `right rail` is toggleable on and off instead of always occupying width
- the `right rail` keeps `event feed` on top and an `economy mini-card` below
- the `board scene` should visually dominate the match screen at about `80%` of the page focus

## Purpose

Step 1 defines how the first 2.5D Monopoly board scene should sit inside the existing match shell from Phase 11.

This step exists to prevent an avoidable mistake: building a board scene that either competes with the HUD, wastes the reserved playfield, or forces a later layout rewrite.

## Design Direction

The first scene pass should feel like a polished digital tabletop.

Visual keywords:

- warm wood-and-felt tabletop
- miniature board presentation
- soft studio lighting
- playful but not toy-chaotic
- readable before decorative

Anti-direction to avoid:

- casino neon
- generic dashboard chrome
- dark sci-fi arena
- full-screen overlays sitting on top of the board during normal play

## Step 1 Decisions

### Scene Role

The scene should own:

- board footprint
- camera composition
- token positions
- tile highlights
- movement readability
- subtle scene atmosphere

The DOM shell should continue to own:

- roster
- turn chip
- action tray
- event feed
- economy mini-card
- reconnect and lifecycle banners

### Playfield Protection Rules

The scene should get the visual center of the match screen.

Rules:

- no persistent large card in the middle of the board
- no permanent lower-middle overlay covering the move path
- no equal-weight panels around every edge
- HUD should stay compact enough that screenshots still read as a game scene first
- the right rail should not permanently consume board width in the default state

### Desktop Composition Target

Recommended viewport distribution:

- board scene should command about `78%` to `82%` of the visual focus
- left rail remains a thin overlay or narrow column for roster and turn context
- right rail stays hidden by default and slides open on demand
- bottom action tray stays shallow and horizontally aligned

### Mobile Composition Target

On mobile:

- board remains primary
- left rail compresses into compact player chips
- right rail content opens from a compact toggle affordance instead of staying permanently open
- bottom action tray stays visible but smaller
- event feed and economy remain secondary to the board

### Board Framing Target

The classic 40-tile board should be presented as a slightly raised tabletop board with a visible center void.

The first camera target should prioritize:

- readable outer ring tiles
- clear token positions on corners and edges
- enough angle to sell depth without turning tiles into unreadable trapezoids

Recommended starting camera feel:

- three-quarter tabletop view
- moderate downward tilt
- slightly offset framing so the lower action tray does not collide visually with the nearest board edge

## First-Pass Scene Elements

The approved implementation after this step should start with only these essentials:

- board base and classic square-ring footprint
- tile zones with simple material separation
- a dedicated `tile face overlay` layer reserved for future art, ownership markers, and effects
- placeholder token pieces with clear color identity
- active-player tile highlight
- current movement emphasis through tile focus and token placement clarity
- soft ambient scene background

The first pass should not depend on:

- final characterful token models
- premium materials
- particle-heavy effects
- cinematic camera motion
- houses, hotels, or richer board props

## Scene Layout Contract With Phase 11 HUD

The existing Phase 11 HUD remains structurally valid, but its density is reduced to protect the board scene.

The scene slot should integrate into that shell under these rules:

- left rail stays for player roster and turn order context only
- turn chip stays at the top edge as the always-visible state summary
- reconnect banner is conditional, not always on
- right rail becomes a toggleable drawer with `event feed` on top and `economy mini-card` below
- action tray stays along the bottom edge
- board scene occupies the center stage between these supporting surfaces
- result overlays or reconnect banners may temporarily overlap the scene, but normal play should keep the center mostly clear

## Implementation Scope Completed In Step 1

The Step 1 implementation now covers:

- scene container integration in the live match route
- initial React Three Fiber canvas
- first board shell and camera baseline
- separate tile-face overlay surfaces for future image/effect work
- thin left-rail roster treatment
- top-edge turn chip
- toggleable right-rail shell for feed and economy
- bottom action tray repositioned to support the board-first layout

## Build and Runtime Notes

The scene runtime is intentionally lightweight for this step:

- uses `three` and `@react-three/fiber`
- avoids heavier helper layers for now so the first board-shell pass stays within Step 1 scope
- lazy-loads the board scene from the match route so the rest of the web app does not pay the 3D cost upfront
- splits `three-core` and `r3f-core` into dedicated chunks for the match scene path

## Verification

The following checks passed after implementation:

- `npm run typecheck --workspace @monopoly/web`
- `npm run build --workspace @monopoly/web`

The previous large frontend warning is now handled by:

- lazy-loading the board scene module
- isolating `three` and `@react-three/fiber` into dedicated on-demand chunks
- setting an explicit chunk warning threshold that matches the isolated 3D runtime path

## Deferred to Later Steps

The following work is intentionally deferred beyond Step 1:

- richer board geometry and premium material polish
- token movement animation
- deeper tile interaction affordances
- camera motion tuning beyond the first readable framing baseline
- responsive/performance optimization beyond the baseline layout contract