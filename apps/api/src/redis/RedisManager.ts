import type { Redis as RedisType, RedisOptions } from "ioredis";
import { default as Redis } from "ioredis";

export class RedisManager {
  private static instance: RedisManager | null = null;

  private pubClient!: RedisType;
  private subClient!: RedisType;

  private constructor(private readonly config: RedisOptions) {}

  static init(config: RedisOptions): RedisManager {
    if (!RedisManager.instance) {
      RedisManager.instance = new RedisManager(config);
      RedisManager.instance.connect();
    }
    return RedisManager.instance;
  }

  static get(): RedisManager {
    if (!RedisManager.instance) {
      throw new Error("RedisManager not initialized");
    }
    return RedisManager.instance;
  }

  private connect() {
    // @ts-ignore
    this.pubClient = new Redis(this.config);
    // @ts-ignore
    this.subClient = new Redis(this.config);
  }

  get pub() {
    return this.pubClient;
  }

  get sub() {
    return this.subClient;
  }

  async disconnect() {
    await Promise.all([this.pubClient.quit(), this.subClient.quit()]);
  }
}
