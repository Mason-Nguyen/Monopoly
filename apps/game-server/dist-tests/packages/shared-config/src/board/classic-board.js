import { MVP_START_SALARY, MVP_STARTING_MONEY } from "../constants/index.js";
import { assertValidBoardConfig } from "./validate-board-config.js";
export const CLASSIC_BOARD_ID = "classic-40";
export const CLASSIC_BOARD_NAME = "Classic 40 Tile Board";
const CLASSIC_PROPERTIES = [
    { propertyId: "mediterranean_avenue", tileIndex: 1, key: "mediterranean_avenue", name: "Mediterranean Avenue", purchasePrice: 60, rentAmount: 2, colorGroup: "brown" },
    { propertyId: "baltic_avenue", tileIndex: 3, key: "baltic_avenue", name: "Baltic Avenue", purchasePrice: 60, rentAmount: 4, colorGroup: "brown" },
    { propertyId: "oriental_avenue", tileIndex: 6, key: "oriental_avenue", name: "Oriental Avenue", purchasePrice: 100, rentAmount: 6, colorGroup: "light_blue" },
    { propertyId: "vermont_avenue", tileIndex: 8, key: "vermont_avenue", name: "Vermont Avenue", purchasePrice: 100, rentAmount: 6, colorGroup: "light_blue" },
    { propertyId: "connecticut_avenue", tileIndex: 9, key: "connecticut_avenue", name: "Connecticut Avenue", purchasePrice: 120, rentAmount: 8, colorGroup: "light_blue" },
    { propertyId: "st_charles_place", tileIndex: 11, key: "st_charles_place", name: "St. Charles Place", purchasePrice: 140, rentAmount: 10, colorGroup: "pink" },
    { propertyId: "states_avenue", tileIndex: 13, key: "states_avenue", name: "States Avenue", purchasePrice: 140, rentAmount: 10, colorGroup: "pink" },
    { propertyId: "virginia_avenue", tileIndex: 14, key: "virginia_avenue", name: "Virginia Avenue", purchasePrice: 160, rentAmount: 12, colorGroup: "pink" },
    { propertyId: "st_james_place", tileIndex: 16, key: "st_james_place", name: "St. James Place", purchasePrice: 180, rentAmount: 14, colorGroup: "orange" },
    { propertyId: "tennessee_avenue", tileIndex: 18, key: "tennessee_avenue", name: "Tennessee Avenue", purchasePrice: 180, rentAmount: 14, colorGroup: "orange" },
    { propertyId: "new_york_avenue", tileIndex: 19, key: "new_york_avenue", name: "New York Avenue", purchasePrice: 200, rentAmount: 16, colorGroup: "orange" },
    { propertyId: "kentucky_avenue", tileIndex: 21, key: "kentucky_avenue", name: "Kentucky Avenue", purchasePrice: 220, rentAmount: 18, colorGroup: "red" },
    { propertyId: "indiana_avenue", tileIndex: 23, key: "indiana_avenue", name: "Indiana Avenue", purchasePrice: 220, rentAmount: 18, colorGroup: "red" },
    { propertyId: "illinois_avenue", tileIndex: 24, key: "illinois_avenue", name: "Illinois Avenue", purchasePrice: 240, rentAmount: 20, colorGroup: "red" },
    { propertyId: "atlantic_avenue", tileIndex: 26, key: "atlantic_avenue", name: "Atlantic Avenue", purchasePrice: 260, rentAmount: 22, colorGroup: "yellow" },
    { propertyId: "ventnor_avenue", tileIndex: 27, key: "ventnor_avenue", name: "Ventnor Avenue", purchasePrice: 260, rentAmount: 22, colorGroup: "yellow" },
    { propertyId: "marvin_gardens", tileIndex: 29, key: "marvin_gardens", name: "Marvin Gardens", purchasePrice: 280, rentAmount: 24, colorGroup: "yellow" },
    { propertyId: "pacific_avenue", tileIndex: 31, key: "pacific_avenue", name: "Pacific Avenue", purchasePrice: 300, rentAmount: 26, colorGroup: "green" },
    { propertyId: "north_carolina_avenue", tileIndex: 32, key: "north_carolina_avenue", name: "North Carolina Avenue", purchasePrice: 300, rentAmount: 26, colorGroup: "green" },
    { propertyId: "pennsylvania_avenue", tileIndex: 34, key: "pennsylvania_avenue", name: "Pennsylvania Avenue", purchasePrice: 320, rentAmount: 28, colorGroup: "green" },
    { propertyId: "park_place", tileIndex: 37, key: "park_place", name: "Park Place", purchasePrice: 350, rentAmount: 35, colorGroup: "dark_blue" },
    { propertyId: "boardwalk", tileIndex: 39, key: "boardwalk", name: "Boardwalk", purchasePrice: 400, rentAmount: 50, colorGroup: "dark_blue" }
];
const CLASSIC_TILES = [
    { tileIndex: 0, key: "go", name: "GO", tileType: "start" },
    { tileIndex: 1, key: "mediterranean_avenue", name: "Mediterranean Avenue", tileType: "property", propertyId: "mediterranean_avenue" },
    { tileIndex: 2, key: "community_chest_1", name: "Community Chest", tileType: "neutral" },
    { tileIndex: 3, key: "baltic_avenue", name: "Baltic Avenue", tileType: "property", propertyId: "baltic_avenue" },
    { tileIndex: 4, key: "income_tax", name: "Income Tax", tileType: "tax", taxAmount: 200 },
    { tileIndex: 5, key: "reading_railroad", name: "Reading Railroad", tileType: "neutral" },
    { tileIndex: 6, key: "oriental_avenue", name: "Oriental Avenue", tileType: "property", propertyId: "oriental_avenue" },
    { tileIndex: 7, key: "chance_1", name: "Chance", tileType: "neutral" },
    { tileIndex: 8, key: "vermont_avenue", name: "Vermont Avenue", tileType: "property", propertyId: "vermont_avenue" },
    { tileIndex: 9, key: "connecticut_avenue", name: "Connecticut Avenue", tileType: "property", propertyId: "connecticut_avenue" },
    { tileIndex: 10, key: "jail", name: "Jail", tileType: "jail" },
    { tileIndex: 11, key: "st_charles_place", name: "St. Charles Place", tileType: "property", propertyId: "st_charles_place" },
    { tileIndex: 12, key: "electric_company", name: "Electric Company", tileType: "neutral" },
    { tileIndex: 13, key: "states_avenue", name: "States Avenue", tileType: "property", propertyId: "states_avenue" },
    { tileIndex: 14, key: "virginia_avenue", name: "Virginia Avenue", tileType: "property", propertyId: "virginia_avenue" },
    { tileIndex: 15, key: "pennsylvania_railroad", name: "Pennsylvania Railroad", tileType: "neutral" },
    { tileIndex: 16, key: "st_james_place", name: "St. James Place", tileType: "property", propertyId: "st_james_place" },
    { tileIndex: 17, key: "community_chest_2", name: "Community Chest", tileType: "neutral" },
    { tileIndex: 18, key: "tennessee_avenue", name: "Tennessee Avenue", tileType: "property", propertyId: "tennessee_avenue" },
    { tileIndex: 19, key: "new_york_avenue", name: "New York Avenue", tileType: "property", propertyId: "new_york_avenue" },
    { tileIndex: 20, key: "free_parking", name: "Free Parking", tileType: "free_parking" },
    { tileIndex: 21, key: "kentucky_avenue", name: "Kentucky Avenue", tileType: "property", propertyId: "kentucky_avenue" },
    { tileIndex: 22, key: "chance_2", name: "Chance", tileType: "neutral" },
    { tileIndex: 23, key: "indiana_avenue", name: "Indiana Avenue", tileType: "property", propertyId: "indiana_avenue" },
    { tileIndex: 24, key: "illinois_avenue", name: "Illinois Avenue", tileType: "property", propertyId: "illinois_avenue" },
    { tileIndex: 25, key: "b_and_o_railroad", name: "B and O Railroad", tileType: "neutral" },
    { tileIndex: 26, key: "atlantic_avenue", name: "Atlantic Avenue", tileType: "property", propertyId: "atlantic_avenue" },
    { tileIndex: 27, key: "ventnor_avenue", name: "Ventnor Avenue", tileType: "property", propertyId: "ventnor_avenue" },
    { tileIndex: 28, key: "water_works", name: "Water Works", tileType: "neutral" },
    { tileIndex: 29, key: "marvin_gardens", name: "Marvin Gardens", tileType: "property", propertyId: "marvin_gardens" },
    { tileIndex: 30, key: "go_to_jail", name: "Go To Jail", tileType: "go_to_jail", targetTileIndex: 10 },
    { tileIndex: 31, key: "pacific_avenue", name: "Pacific Avenue", tileType: "property", propertyId: "pacific_avenue" },
    { tileIndex: 32, key: "north_carolina_avenue", name: "North Carolina Avenue", tileType: "property", propertyId: "north_carolina_avenue" },
    { tileIndex: 33, key: "community_chest_3", name: "Community Chest", tileType: "neutral" },
    { tileIndex: 34, key: "pennsylvania_avenue", name: "Pennsylvania Avenue", tileType: "property", propertyId: "pennsylvania_avenue" },
    { tileIndex: 35, key: "short_line", name: "Short Line", tileType: "neutral" },
    { tileIndex: 36, key: "chance_3", name: "Chance", tileType: "neutral" },
    { tileIndex: 37, key: "park_place", name: "Park Place", tileType: "property", propertyId: "park_place" },
    { tileIndex: 38, key: "luxury_tax", name: "Luxury Tax", tileType: "tax", taxAmount: 100 },
    { tileIndex: 39, key: "boardwalk", name: "Boardwalk", tileType: "property", propertyId: "boardwalk" }
];
export const CLASSIC_BOARD_CONFIG = assertValidBoardConfig({
    boardId: CLASSIC_BOARD_ID,
    name: CLASSIC_BOARD_NAME,
    tileCount: 40,
    startSalary: MVP_START_SALARY,
    startingMoney: MVP_STARTING_MONEY,
    tiles: CLASSIC_TILES,
    properties: CLASSIC_PROPERTIES
});
const CLASSIC_TILE_CONFIG_BY_INDEX = new Map(CLASSIC_BOARD_CONFIG.tiles.map((tile) => [tile.tileIndex, tile]));
const CLASSIC_PROPERTY_CONFIG_BY_ID = new Map(CLASSIC_BOARD_CONFIG.properties.map((property) => [property.propertyId, property]));
export function getClassicTileConfig(tileIndex) {
    return CLASSIC_TILE_CONFIG_BY_INDEX.get(tileIndex);
}
export function getClassicPropertyConfig(propertyId) {
    return CLASSIC_PROPERTY_CONFIG_BY_ID.get(propertyId);
}
