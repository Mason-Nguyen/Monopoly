import type { MatchId, PlayerId, PropertyId } from "../ids/index.js";
export declare const GAME_ROLL_DICE_COMMAND = "game:rollDice";
export declare const GAME_BUY_PROPERTY_COMMAND = "game:buyProperty";
export declare const GAME_END_TURN_COMMAND = "game:endTurn";
export type GameCommandName = typeof GAME_ROLL_DICE_COMMAND | typeof GAME_BUY_PROPERTY_COMMAND | typeof GAME_END_TURN_COMMAND;
export interface GameRollDiceCommand {
}
export interface GameBuyPropertyCommand {
    propertyId: PropertyId;
}
export interface GameEndTurnCommand {
}
export interface MatchJoinOptions {
    playerId: PlayerId;
    matchId: MatchId;
    reconnectToken?: string;
}
