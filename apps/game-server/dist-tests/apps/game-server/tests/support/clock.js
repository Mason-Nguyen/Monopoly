export class FakeRoomClock {
    constructor() {
        this.scheduledTimeouts = [];
    }
    get pendingCount() {
        return this.scheduledTimeouts.filter((timeout) => !timeout.cleared).length;
    }
    setTimeout(callback, delayMs) {
        const timeout = {
            callback,
            delayMs,
            cleared: false
        };
        this.scheduledTimeouts.push(timeout);
        return {
            clear: () => {
                timeout.cleared = true;
            }
        };
    }
    runNext() {
        while (this.scheduledTimeouts.length > 0) {
            const timeout = this.scheduledTimeouts.shift();
            if (!timeout || timeout.cleared) {
                continue;
            }
            timeout.callback();
            return true;
        }
        return false;
    }
    clear() {
        this.scheduledTimeouts.length = 0;
    }
    getSnapshot() {
        return this.scheduledTimeouts.map((timeout) => ({
            delayMs: timeout.delayMs,
            cleared: timeout.cleared
        }));
    }
}
