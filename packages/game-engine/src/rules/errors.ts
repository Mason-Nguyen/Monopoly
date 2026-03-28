export class EngineRuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EngineRuleError";
  }
}