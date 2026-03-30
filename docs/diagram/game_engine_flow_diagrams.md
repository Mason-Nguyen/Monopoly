# Game Engine Flow Diagrams — Based on Unit Tests

Sơ đồ flow được vẽ từ 2 file unit test:
- [movement-and-economy.test.ts](file:///d:/AI_Project/Monopoly/packages/game-engine/tests/movement-and-economy.test.ts)
- [jail-and-bankruptcy.test.ts](file:///d:/AI_Project/Monopoly/packages/game-engine/tests/jail-and-bankruptcy.test.ts)

---

## 1. Tổng quan: Game Engine Turn Cycle

Sơ đồ chính thể hiện vòng lặp 1 lượt chơi (turn) của game engine, bao gồm tất cả các nhánh logic được cover bởi unit test.

```mermaid
flowchart TD
    START["🎮 Match Start<br/>createInitialMatchState()"] --> INIT["Initialize:<br/>• 4 players, balance = $1500<br/>• All properties unowned<br/>• turnOrder = [p1,p2,p3,p4]<br/>• phase = await_roll"]

    INIT --> AWAIT_ROLL["⏳ Phase: await_roll<br/>Available: [roll_dice]"]

    AWAIT_ROLL --> ROLL["🎲 Action: roll_dice"]
    ROLL --> DICE["resolveDiceRoll()<br/>Calculate dice total"]
    DICE --> MOVE["calculateMovement()<br/>Move player on board"]

    MOVE --> PASS_GO{"Passed/Landed<br/>on START?"}
    PASS_GO -- Yes --> SALARY["💰 +$200 salary<br/>Event: payment_applied<br/>reason: start_salary"]
    SALARY --> RESOLVE_TILE
    PASS_GO -- No --> RESOLVE_TILE

    RESOLVE_TILE["resolveActivePlayerTile()"]

    RESOLVE_TILE --> TILE_TYPE{"Tile Type?"}

    %% Neutral tiles
    TILE_TYPE -- "start / neutral /<br/>free_parking / jail" --> NEUTRAL_END["Phase → await_end_turn<br/>Event: tile_resolved"]

    %% Property tile
    TILE_TYPE -- "property" --> PROP_CHECK{"Property<br/>Ownership?"}

    PROP_CHECK -- "Unowned &<br/>Can Afford" --> BUY_OPTION["Phase → await_optional_action<br/>canBuyCurrentProperty = true<br/>Available: [buy_property, end_turn]"]
    PROP_CHECK -- "Unowned &<br/>Can't Afford" --> NEUTRAL_END
    PROP_CHECK -- "Owned by Self" --> NEUTRAL_END
    PROP_CHECK -- "Owned by Other" --> PAY_RENT["💸 Pay Rent<br/>resolveMandatoryPlayerPayment()"]

    PAY_RENT --> RENT_AFFORD{"Can afford<br/>rent?"}
    RENT_AFFORD -- Yes --> RENT_OK["Payer balance -= rent<br/>Owner balance += rent<br/>Event: payment_applied"]
    RENT_OK --> NEUTRAL_END
    RENT_AFFORD -- No --> BANKRUPT["💀 BANKRUPTCY"]

    %% Tax tile
    TILE_TYPE -- "tax" --> PAY_TAX["💸 Pay Tax<br/>resolveMandatoryBankPayment()"]
    PAY_TAX --> TAX_AFFORD{"Can afford<br/>tax?"}
    TAX_AFFORD -- Yes --> TAX_OK["Balance -= tax<br/>Event: payment_applied"]
    TAX_OK --> NEUTRAL_END
    TAX_AFFORD -- No --> BANKRUPT

    %% Go to Jail tile
    TILE_TYPE -- "go_to_jail" --> JAIL_MOVE["🔒 Move to Jail (tile 10)<br/>jail.isInJail = true<br/>jail.turnsRemaining = 1<br/>Events: tile_resolved,<br/>player_moved, jail_state_changed"]
    JAIL_MOVE --> NEUTRAL_END

    %% Buy Property flow
    BUY_OPTION --> BUY_DECIDE{"Player<br/>Decision?"}
    BUY_DECIDE -- "buy_property" --> BUY_EXEC["purchasePropertyOrThrow()<br/>Balance -= purchasePrice<br/>Property → owned by player<br/>Events: payment_applied,<br/>property_purchased"]
    BUY_EXEC --> BUY_END["Phase → await_end_turn"]
    BUY_DECIDE -- "end_turn" --> END_TURN

    %% End Turn
    NEUTRAL_END --> AWAIT_END["⏳ Phase: await_end_turn<br/>Available: [end_turn]"]
    BUY_END --> AWAIT_END
    AWAIT_END --> END_TURN["▶️ Action: end_turn"]

    END_TURN --> ADVANCE["advanceToNextPlayableTurn()"]

    %% Bankruptcy flow
    BANKRUPT --> ELIMINATE["eliminatePlayer()<br/>• isBankrupt = true<br/>• balance = 0<br/>• Release all properties<br/>• ownedPropertyIds = []<br/>Event: player_eliminated"]
    ELIMINATE --> CHECK_MATCH{"Active<br/>players > 1?"}
    CHECK_MATCH -- Yes --> ADVANCE
    CHECK_MATCH -- No --> MATCH_END["🏆 Match Ended<br/>status = finished<br/>winner = last remaining<br/>endReason = all_others_bankrupt<br/>Event: match_ended"]

    ADVANCE --> NEXT_PLAYER["getNextActivePlayerId()"]
    NEXT_PLAYER --> JAIL_CHECK{"Next player<br/>in Jail?"}
    JAIL_CHECK -- No --> AWAIT_ROLL
    JAIL_CHECK -- Yes --> JAIL_SKIP["Skip jailed player:<br/>turnsRemaining -= 1"]
    JAIL_SKIP --> RELEASE_CHECK{"turnsRemaining<br/>== 0?"}
    RELEASE_CHECK -- Yes --> JAIL_RELEASE["🔓 Released from Jail<br/>isInJail = false<br/>Event: jail_state_changed"]
    RELEASE_CHECK -- No --> JAIL_STILL["Still in Jail<br/>Event: jail_state_changed"]
    JAIL_RELEASE --> NEXT_PLAYER
    JAIL_STILL --> NEXT_PLAYER

    style START fill:#4CAF50,color:#fff
    style MATCH_END fill:#FF9800,color:#fff
    style BANKRUPT fill:#f44336,color:#fff
    style ELIMINATE fill:#f44336,color:#fff
    style SALARY fill:#4CAF50,color:#fff
    style BUY_EXEC fill:#2196F3,color:#fff
    style JAIL_MOVE fill:#9C27B0,color:#fff
    style JAIL_RELEASE fill:#4CAF50,color:#fff
```

---

## 2. Turn Phase State Machine

Sơ đồ state machine thể hiện các trạng thái (phase) của một turn, tương ứng với `EngineTurnState.phase`.

```mermaid
stateDiagram-v2
    [*] --> await_roll : Match start / Turn advance

    await_roll --> resolving_tile : roll_dice action
    
    resolving_tile --> await_optional_action : Unowned property & can afford
    resolving_tile --> await_end_turn : Neutral / Tax / Rent / Jail / Own property
    resolving_tile --> turn_complete : Player eliminated → Match ended

    await_optional_action --> await_end_turn : buy_property action
    await_optional_action --> await_end_turn : end_turn (skip buy)

    await_end_turn --> await_roll : end_turn → next player
    await_end_turn --> turn_complete : end_turn → match ended (1 player left)

    turn_complete --> [*] : Match finished
```

---

## 3. Chi tiết từng Test Case → Flow

### Test File 1: [movement-and-economy.test.ts](file:///d:/AI_Project/Monopoly/packages/game-engine/tests/movement-and-economy.test.ts)

````carousel
### Test 1: Initial State
Kiểm tra trạng thái khởi tạo match.

```mermaid
flowchart LR
    A["createInitialMatchState()"] --> B["✅ activePlayer = p1<br/>✅ phase = await_roll<br/>✅ balance = $1500 each<br/>✅ position = 0 each<br/>✅ all properties unowned<br/>✅ turnOrder = [p1,p2,p3,p4]"]
```
<!-- slide -->
### Test 2: Roll Dice — Wrap Start + Buy Option
Player ở vị trí 39, roll [1,1] → vị trí 1 (qua GO).

```mermaid
flowchart TD
    A["p1 at position 39"] --> B["🎲 roll_dice [1,1]<br/>total = 2"]
    B --> C["Move: 39 → 1<br/>Passed START ✅"]
    C --> D["💰 +$200 salary<br/>Balance: $1500 → $1700"]
    D --> E["Tile 1 = Mediterranean Ave<br/>Unowned property"]
    E --> F["Phase → await_optional_action<br/>canBuyCurrentProperty = true"]
    F --> G["Available: [buy_property, end_turn]"]
    
    H["Events sequence:"] --> I["dice_rolled → player_moved<br/>→ payment_applied → tile_resolved"]
```
<!-- slide -->
### Test 3: Buy Property
Player roll đến ô property chưa owned → chọn buy.

```mermaid
flowchart TD
    A["Roll to Mediterranean Ave<br/>Balance = $1700"] --> B["🛒 buy_property<br/>propertyId = mediterranean_avenue"]
    B --> C["Balance -= $60<br/>$1700 → $1640"]
    C --> D["Property → owned by p1<br/>ownedPropertyIds = [mediterranean_avenue]"]
    D --> E["Phase → await_end_turn"]
    
    F["Events:"] --> G["payment_applied → property_purchased"]
```
<!-- slide -->
### Test 4: Pay Rent
Player đến ô sở hữu bởi người khác → tự động trả rent.

```mermaid
flowchart TD
    A["p1 at position 0<br/>Baltic Ave owned by p2"] --> B["🎲 roll_dice [1,2]<br/>Move to position 3"]
    B --> C["Tile = Baltic Ave<br/>Owned by p2"]
    C --> D["💸 Auto pay rent = $4<br/>p1: $1500 → $1496<br/>p2: $1500 → $1504"]
    D --> E["Phase → await_end_turn"]
    
    F["Events:"] --> G["dice_rolled → player_moved<br/>→ tile_resolved → payment_applied"]
```
<!-- slide -->
### Test 5: Tax Tile
Player đến ô thuế → tự động trừ tiền.

```mermaid
flowchart TD
    A["p1 at position 2"] --> B["🎲 roll_dice [1,1]<br/>Move to position 4"]
    B --> C["Tile 4 = Income Tax<br/>taxAmount = $200"]
    C --> D["💸 Pay tax = $200<br/>$1500 → $1300"]
    D --> E["Phase → await_end_turn"]
    
    F["Events:"] --> G["dice_rolled → player_moved<br/>→ tile_resolved → payment_applied"]
```
<!-- slide -->
### Test 6: Go To Jail
Player đến ô "Go to Jail" → bị dịch chuyển vào Jail.

```mermaid
flowchart TD
    A["p1 at position 28"] --> B["🎲 roll_dice [1,1]<br/>Move to position 30"]
    B --> C["Tile 30 = Go To Jail"]
    C --> D["🔒 Forced move → position 10<br/>jail.isInJail = true<br/>jail.turnsRemaining = 1"]
    D --> E["Phase → await_end_turn"]
    
    F["Events:"] --> G["dice_rolled → player_moved<br/>→ tile_resolved → player_moved<br/>→ jail_state_changed"]
```
````

### Test File 2: [jail-and-bankruptcy.test.ts](file:///d:/AI_Project/Monopoly/packages/game-engine/tests/jail-and-bankruptcy.test.ts)

````carousel
### Test 7: Bankruptcy by Tax
Player không đủ tiền trả thuế → bị loại.

```mermaid
flowchart TD
    A["p1: balance = $100<br/>position = 2"] --> B["🎲 roll_dice [1,1]<br/>Move to position 4"]
    B --> C["Tile 4 = Income Tax<br/>taxAmount = $200"]
    C --> D{"balance $100 < tax $200"}
    D --> E["💀 BANKRUPT<br/>isBankrupt = true<br/>balance = 0"]
    E --> F["Turn → p2<br/>turnCompleted = true"]
    
    G["Events:"] --> H["dice_rolled → player_moved<br/>→ tile_resolved → player_eliminated<br/>→ turn_advanced"]
```
<!-- slide -->
### Test 8: Bankruptcy by Rent — Release Properties
Player không đủ trả rent → bị loại, properties trả về bank.

```mermaid
flowchart TD
    A["p1: balance = $3<br/>owns Boardwalk<br/>Baltic Ave owned by p2"] --> B["🎲 roll_dice [1,2]<br/>Move to position 3"]
    B --> C["Tile = Baltic Ave<br/>Rent = $4, balance = $3"]
    C --> D{"balance $3 < rent $4"}
    D --> E["💀 BANKRUPT<br/>• isBankrupt = true<br/>• ownedPropertyIds = []<br/>• Boardwalk → unowned (null)"]
    E --> F["p2 balance unchanged = $1500<br/>(no partial payment)<br/>Turn → p2"]
    
    G["Note:"] --> H["Bankrupt player's properties<br/>are released to the bank,<br/>NOT transferred to creditor"]
```
<!-- slide -->
### Test 9: Match Ends — Last Player Standing
Khi chỉ còn 1 player active, match kết thúc.

```mermaid
flowchart TD
    A["p3, p4: already bankrupt<br/>p1: balance = $100, pos = 2"] --> B["🎲 roll_dice [1,1]<br/>Move to position 4"]
    B --> C["Income Tax = $200<br/>p1 can't afford"]
    C --> D["💀 p1 ELIMINATED"]
    D --> E{"Active players?<br/>Only p2 remains"}
    E --> F["🏆 MATCH ENDED<br/>status = finished<br/>winner = p2<br/>endReason = all_others_bankrupt<br/>availableActions = []"]
    
    G["Events:"] --> H["dice_rolled → player_moved<br/>→ tile_resolved → player_eliminated<br/>→ match_ended"]
```
<!-- slide -->
### Test 10: Jail Skip & Auto-Release
Player trong jail bị skip 1 turn, sau đó tự động release.

```mermaid
flowchart TD
    A["p1: phase = await_end_turn<br/>p2: inJail, turnsRemaining = 1"] --> B["p1 → end_turn"]
    B --> C["advanceToNextPlayableTurn()"]
    C --> D["Next = p2 (jailed)"]
    D --> E["turnsRemaining: 1 → 0<br/>isInJail: true → false<br/>🔓 AUTO-RELEASED"]
    E --> F["Skip p2, advance again"]
    F --> G["Next = p3<br/>turnNumber = 3"]
    
    H["Events:"] --> I["turn_advanced (→p2)<br/>→ jail_state_changed (released)<br/>→ turn_advanced (→p3)"]
    
    J["Key insight:"] --> K["Jailed player is SKIPPED<br/>but released during the skip.<br/>They play normally next cycle."]
```
````

---

## 4. Event Flow Summary

Bảng tóm tắt chuỗi event cho mỗi scenario được test:

| # | Scenario | Events Sequence |
|---|----------|----------------|
| 1 | Roll → Unowned Property (pass GO) | `dice_rolled` → `player_moved` → `payment_applied` (salary) → `tile_resolved` |
| 2 | Buy Property | `payment_applied` (purchase) → `property_purchased` |
| 3 | Land on Owned Property (rent) | `dice_rolled` → `player_moved` → `tile_resolved` → `payment_applied` (rent) |
| 4 | Land on Tax Tile | `dice_rolled` → `player_moved` → `tile_resolved` → `payment_applied` (tax) |
| 5 | Land on Go To Jail | `dice_rolled` → `player_moved` → `tile_resolved` → `player_moved` → `jail_state_changed` |
| 6 | Bankruptcy by Tax | `dice_rolled` → `player_moved` → `tile_resolved` → `player_eliminated` → `turn_advanced` |
| 7 | Bankruptcy by Rent (release props) | `dice_rolled` → `player_moved` → `tile_resolved` → `player_eliminated` → `turn_advanced` |
| 8 | Match End (last player) | `dice_rolled` → `player_moved` → `tile_resolved` → `player_eliminated` → `match_ended` |
| 9 | Jail Skip & Release | `turn_advanced` → `jail_state_changed` → `turn_advanced` |

---

## 5. Available Actions by Phase

```mermaid
flowchart LR
    A["await_roll"] -->|"[roll_dice]"| B["resolving_tile"]
    B -->|auto| C["await_optional_action"]
    B -->|auto| D["await_end_turn"]
    C -->|"[buy_property, end_turn]"| D
    D -->|"[end_turn]"| E["Next turn: await_roll"]
    
    style A fill:#FFF3E0
    style C fill:#E3F2FD
    style D fill:#E8F5E9
```

| Phase | Available Actions |
|-------|------------------|
| `await_roll` | `roll_dice` |
| `await_optional_action` | `buy_property`, `end_turn` |
| `await_end_turn` | `end_turn` |
| `turn_complete` | `end_turn` |
| `resolving_tile` | _(none — auto-resolved)_ |
| Match `finished` | _(none)_ |
