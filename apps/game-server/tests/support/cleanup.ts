export type CleanupCallback = () => void | Promise<void>;

export class TestCleanupStack {
  private readonly callbacks: CleanupCallback[] = [];

  add(callback: CleanupCallback): void {
    this.callbacks.push(callback);
  }

  async run(): Promise<void> {
    while (this.callbacks.length > 0) {
      const callback = this.callbacks.pop();

      if (!callback) {
        continue;
      }

      await callback();
    }
  }
}
