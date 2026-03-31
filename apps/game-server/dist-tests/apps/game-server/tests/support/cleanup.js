export class TestCleanupStack {
    constructor() {
        this.callbacks = [];
    }
    add(callback) {
        this.callbacks.push(callback);
    }
    async run() {
        while (this.callbacks.length > 0) {
            const callback = this.callbacks.pop();
            if (!callback) {
                continue;
            }
            await callback();
        }
    }
}
