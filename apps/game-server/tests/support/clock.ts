import type { TestTimeoutHandle } from "./contracts.js";

interface ScheduledTimeout {
  callback: () => void;
  delayMs: number;
  cleared: boolean;
}

export class FakeRoomClock {
  private readonly scheduledTimeouts: ScheduledTimeout[] = [];

  get pendingCount(): number {
    return this.scheduledTimeouts.filter((timeout) => !timeout.cleared).length;
  }

  setTimeout(callback: () => void, delayMs: number): TestTimeoutHandle {
    const timeout: ScheduledTimeout = {
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

  runNext(): boolean {
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

  clear(): void {
    this.scheduledTimeouts.length = 0;
  }

  getSnapshot(): Array<{ delayMs: number; cleared: boolean }> {
    return this.scheduledTimeouts.map((timeout) => ({
      delayMs: timeout.delayMs,
      cleared: timeout.cleared
    }));
  }
}
