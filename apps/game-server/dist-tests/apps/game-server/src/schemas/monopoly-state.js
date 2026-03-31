var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ArraySchema, MapSchema, Schema, type } from "@colyseus/schema";
export class JailStateSchema extends Schema {
    constructor() {
        super(...arguments);
        this.isInJail = false;
        this.turnsRemaining = 0;
    }
}
__decorate([
    type("boolean")
], JailStateSchema.prototype, "isInJail", void 0);
__decorate([
    type("number")
], JailStateSchema.prototype, "turnsRemaining", void 0);
export class ConnectionStateSchema extends Schema {
    constructor() {
        super(...arguments);
        this.status = "connected";
        this.reconnectDeadlineAt = 0;
    }
}
__decorate([
    type("string")
], ConnectionStateSchema.prototype, "status", void 0);
__decorate([
    type("number")
], ConnectionStateSchema.prototype, "reconnectDeadlineAt", void 0);
export class MatchPlayerStateSchema extends Schema {
    constructor() {
        super(...arguments);
        this.playerId = "";
        this.displayName = "";
        this.turnOrder = 0;
        this.position = 0;
        this.balance = 0;
        this.isBankrupt = false;
        this.isAbandoned = false;
        this.jail = new JailStateSchema();
        this.connection = new ConnectionStateSchema();
    }
}
__decorate([
    type("string")
], MatchPlayerStateSchema.prototype, "playerId", void 0);
__decorate([
    type("string")
], MatchPlayerStateSchema.prototype, "displayName", void 0);
__decorate([
    type("number")
], MatchPlayerStateSchema.prototype, "turnOrder", void 0);
__decorate([
    type("number")
], MatchPlayerStateSchema.prototype, "position", void 0);
__decorate([
    type("number")
], MatchPlayerStateSchema.prototype, "balance", void 0);
__decorate([
    type("boolean")
], MatchPlayerStateSchema.prototype, "isBankrupt", void 0);
__decorate([
    type("boolean")
], MatchPlayerStateSchema.prototype, "isAbandoned", void 0);
__decorate([
    type(JailStateSchema)
], MatchPlayerStateSchema.prototype, "jail", void 0);
__decorate([
    type(ConnectionStateSchema)
], MatchPlayerStateSchema.prototype, "connection", void 0);
export class TileStateSchema extends Schema {
    constructor() {
        super(...arguments);
        this.tileIndex = 0;
        this.key = "";
        this.name = "";
        this.tileType = "neutral";
        this.propertyId = "";
        this.taxAmount = 0;
        this.targetTileIndex = -1;
    }
}
__decorate([
    type("number")
], TileStateSchema.prototype, "tileIndex", void 0);
__decorate([
    type("string")
], TileStateSchema.prototype, "key", void 0);
__decorate([
    type("string")
], TileStateSchema.prototype, "name", void 0);
__decorate([
    type("string")
], TileStateSchema.prototype, "tileType", void 0);
__decorate([
    type("string")
], TileStateSchema.prototype, "propertyId", void 0);
__decorate([
    type("number")
], TileStateSchema.prototype, "taxAmount", void 0);
__decorate([
    type("number")
], TileStateSchema.prototype, "targetTileIndex", void 0);
export class PropertyStateSchema extends Schema {
    constructor() {
        super(...arguments);
        this.propertyId = "";
        this.tileIndex = 0;
        this.key = "";
        this.name = "";
        this.purchasePrice = 0;
        this.rentAmount = 0;
        this.colorGroup = "";
        this.ownerPlayerId = "";
    }
}
__decorate([
    type("string")
], PropertyStateSchema.prototype, "propertyId", void 0);
__decorate([
    type("number")
], PropertyStateSchema.prototype, "tileIndex", void 0);
__decorate([
    type("string")
], PropertyStateSchema.prototype, "key", void 0);
__decorate([
    type("string")
], PropertyStateSchema.prototype, "name", void 0);
__decorate([
    type("number")
], PropertyStateSchema.prototype, "purchasePrice", void 0);
__decorate([
    type("number")
], PropertyStateSchema.prototype, "rentAmount", void 0);
__decorate([
    type("string")
], PropertyStateSchema.prototype, "colorGroup", void 0);
__decorate([
    type("string")
], PropertyStateSchema.prototype, "ownerPlayerId", void 0);
export class BoardStateSchema extends Schema {
    constructor() {
        super(...arguments);
        this.boardId = "";
        this.tileCount = 0;
        this.tiles = new ArraySchema();
        this.properties = new MapSchema();
    }
}
__decorate([
    type("string")
], BoardStateSchema.prototype, "boardId", void 0);
__decorate([
    type("number")
], BoardStateSchema.prototype, "tileCount", void 0);
__decorate([
    type({ array: TileStateSchema })
], BoardStateSchema.prototype, "tiles", void 0);
__decorate([
    type({ map: PropertyStateSchema })
], BoardStateSchema.prototype, "properties", void 0);
export class TurnStateSchema extends Schema {
    constructor() {
        super(...arguments);
        this.turnNumber = 1;
        this.activePlayerId = "";
        this.phase = "await_roll";
        this.diceTotal = 0;
        this.diceValueA = 0;
        this.diceValueB = 0;
        this.currentTileIndex = -1;
        this.canBuyCurrentProperty = false;
        this.awaitingInput = true;
    }
}
__decorate([
    type("number")
], TurnStateSchema.prototype, "turnNumber", void 0);
__decorate([
    type("string")
], TurnStateSchema.prototype, "activePlayerId", void 0);
__decorate([
    type("string")
], TurnStateSchema.prototype, "phase", void 0);
__decorate([
    type("number")
], TurnStateSchema.prototype, "diceTotal", void 0);
__decorate([
    type("number")
], TurnStateSchema.prototype, "diceValueA", void 0);
__decorate([
    type("number")
], TurnStateSchema.prototype, "diceValueB", void 0);
__decorate([
    type("number")
], TurnStateSchema.prototype, "currentTileIndex", void 0);
__decorate([
    type("boolean")
], TurnStateSchema.prototype, "canBuyCurrentProperty", void 0);
__decorate([
    type("boolean")
], TurnStateSchema.prototype, "awaitingInput", void 0);
export class MatchResultStateSchema extends Schema {
    constructor() {
        super(...arguments);
        this.winnerPlayerId = "";
        this.endReason = "";
        this.finishedAt = 0;
    }
}
__decorate([
    type("string")
], MatchResultStateSchema.prototype, "winnerPlayerId", void 0);
__decorate([
    type("string")
], MatchResultStateSchema.prototype, "endReason", void 0);
__decorate([
    type("number")
], MatchResultStateSchema.prototype, "finishedAt", void 0);
export class MonopolyRoomStateSchema extends Schema {
    constructor() {
        super(...arguments);
        this.matchId = "";
        this.sourceLobbyId = "";
        this.status = "playing";
        this.startedAt = 0;
        this.finishedAt = 0;
        this.players = new MapSchema();
        this.board = new BoardStateSchema();
        this.turn = new TurnStateSchema();
        this.result = new MatchResultStateSchema();
    }
}
__decorate([
    type("string")
], MonopolyRoomStateSchema.prototype, "matchId", void 0);
__decorate([
    type("string")
], MonopolyRoomStateSchema.prototype, "sourceLobbyId", void 0);
__decorate([
    type("string")
], MonopolyRoomStateSchema.prototype, "status", void 0);
__decorate([
    type("number")
], MonopolyRoomStateSchema.prototype, "startedAt", void 0);
__decorate([
    type("number")
], MonopolyRoomStateSchema.prototype, "finishedAt", void 0);
__decorate([
    type({ map: MatchPlayerStateSchema })
], MonopolyRoomStateSchema.prototype, "players", void 0);
__decorate([
    type(BoardStateSchema)
], MonopolyRoomStateSchema.prototype, "board", void 0);
__decorate([
    type(TurnStateSchema)
], MonopolyRoomStateSchema.prototype, "turn", void 0);
__decorate([
    type(MatchResultStateSchema)
], MonopolyRoomStateSchema.prototype, "result", void 0);
