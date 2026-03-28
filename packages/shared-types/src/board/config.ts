import type { PropertyColorGroup, TileType } from "../enums/index.js";
import type { BoardId, PropertyId, TileIndex } from "../ids/index.js";

export interface BoardConfig {
  boardId: BoardId;
  name: string;
  tileCount: number;
  startSalary: number;
  startingMoney: number;
  tiles: TileConfig[];
  properties: PropertyConfig[];
}

export interface TileConfig {
  tileIndex: TileIndex;
  key: string;
  name: string;
  tileType: TileType;
  propertyId?: PropertyId;
  taxAmount?: number;
  targetTileIndex?: TileIndex;
}

export interface PropertyConfig {
  propertyId: PropertyId;
  tileIndex: TileIndex;
  key: string;
  name: string;
  purchasePrice: number;
  rentAmount: number;
  colorGroup?: PropertyColorGroup;
}