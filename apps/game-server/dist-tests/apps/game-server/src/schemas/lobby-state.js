var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { MapSchema, Schema, type } from "@colyseus/schema";
export class LobbyPlayerStateSchema extends Schema {
    constructor() {
        super(...arguments);
        this.playerId = "";
        this.displayName = "";
        this.isHost = false;
        this.isReady = false;
        this.joinedAt = 0;
    }
}
__decorate([
    type("string")
], LobbyPlayerStateSchema.prototype, "playerId", void 0);
__decorate([
    type("string")
], LobbyPlayerStateSchema.prototype, "displayName", void 0);
__decorate([
    type("boolean")
], LobbyPlayerStateSchema.prototype, "isHost", void 0);
__decorate([
    type("boolean")
], LobbyPlayerStateSchema.prototype, "isReady", void 0);
__decorate([
    type("number")
], LobbyPlayerStateSchema.prototype, "joinedAt", void 0);
export class LobbyRoomStateSchema extends Schema {
    constructor() {
        super(...arguments);
        this.lobbyId = "";
        this.status = "waiting";
        this.hostPlayerId = "";
        this.minPlayers = 4;
        this.maxPlayers = 6;
        this.playerCount = 0;
        this.players = new MapSchema();
        this.canStartMatch = false;
        this.createdAt = 0;
    }
}
__decorate([
    type("string")
], LobbyRoomStateSchema.prototype, "lobbyId", void 0);
__decorate([
    type("string")
], LobbyRoomStateSchema.prototype, "status", void 0);
__decorate([
    type("string")
], LobbyRoomStateSchema.prototype, "hostPlayerId", void 0);
__decorate([
    type("number")
], LobbyRoomStateSchema.prototype, "minPlayers", void 0);
__decorate([
    type("number")
], LobbyRoomStateSchema.prototype, "maxPlayers", void 0);
__decorate([
    type("number")
], LobbyRoomStateSchema.prototype, "playerCount", void 0);
__decorate([
    type({ map: LobbyPlayerStateSchema })
], LobbyRoomStateSchema.prototype, "players", void 0);
__decorate([
    type("boolean")
], LobbyRoomStateSchema.prototype, "canStartMatch", void 0);
__decorate([
    type("number")
], LobbyRoomStateSchema.prototype, "createdAt", void 0);
