export class EngineRuleError extends Error {
    constructor(message) {
        super(message);
        this.name = "EngineRuleError";
    }
}
