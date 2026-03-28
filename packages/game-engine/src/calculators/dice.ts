import type { EngineDiceRoll, EngineDiceSource, EngineDiceValues } from "../types/index.js";

function assertDieValue(value: number, label: string): number {
  if (!Number.isInteger(value) || value < 1 || value > 6) {
    throw new Error(`${label} must be an integer between 1 and 6.`);
  }

  return value;
}

export function normalizeDiceValues(diceValues: EngineDiceValues): EngineDiceRoll {
  const valueA = assertDieValue(diceValues.valueA, "Dice value A");
  const valueB = assertDieValue(diceValues.valueB, "Dice value B");

  return {
    valueA,
    valueB,
    total: valueA + valueB
  };
}

export function resolveDiceRoll(
  diceValues?: EngineDiceValues,
  diceSource?: EngineDiceSource
): EngineDiceRoll {
  if (diceValues) {
    return normalizeDiceValues(diceValues);
  }

  if (!diceSource) {
    throw new Error(
      "Dice values or a dice source are required to resolve a deterministic engine roll."
    );
  }

  return normalizeDiceValues(diceSource.rollDice());
}