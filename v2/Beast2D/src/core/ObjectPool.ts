/* ObjectPool.ts
  Generic pool for objects that are expensive to create (for example
  bullets). `reset` runs when an object is handed out again.
*/

export class ObjectPool<T> {
  private free: T[] = [];
  private freeSet = new Set<T>();

  private readonly factory: () => T;
  private readonly reset: (item: T) => void;
  private readonly maxSize: number;

  constructor(
    factory: () => T,
    reset: (item: T) => void = () => {},
    maxSize: number = Infinity,
  ) {
    this.factory = factory;
    this.reset = reset;
    this.maxSize = maxSize;
  }

  acquire(): T {
    const item = this.free.pop();
    if (item === undefined) return this.factory();
    this.freeSet.delete(item);
    this.reset(item);
    return item;
  }

  /** Returns an item to the pool. Returns false if it was dropped. */
  release(item: T): boolean {
    if (this.freeSet.has(item) || this.free.length >= this.maxSize) {
      return false;
    }
    this.free.push(item);
    this.freeSet.add(item);
    return true;
  }

  get size(): number {
    return this.free.length;
  }

  clear(dispose?: (item: T) => void): void {
    if (dispose) this.free.forEach(dispose);
    this.free = [];
    this.freeSet.clear();
  }
}
