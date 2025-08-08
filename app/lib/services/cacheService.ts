import { Redis } from '@upstash/redis';

export class CacheService {
  private redis: Redis | null = null;
  private inMemoryCache: Map<string, { value: any; expiry: number }> = new Map();
  private useInMemory = false;

  constructor() {
    // Try to initialize Redis, fall back to in-memory if not available
    try {
      if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        this.redis = new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
      } else {
        console.log('Redis not configured, using in-memory cache');
        this.useInMemory = true;
      }
    } catch (error) {
      console.error('Failed to initialize Redis, using in-memory cache:', error);
      this.useInMemory = true;
    }
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      if (this.useInMemory) {
        const cached = this.inMemoryCache.get(key);
        if (cached) {
          if (cached.expiry > Date.now()) {
            return cached.value;
          } else {
            this.inMemoryCache.delete(key);
          }
        }
        return null;
      }

      if (this.redis) {
        const value = await this.redis.get(key);
        return value as T;
      }
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set value in cache with TTL (in seconds)
   */
  async set<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
    try {
      if (this.useInMemory) {
        this.inMemoryCache.set(key, {
          value,
          expiry: Date.now() + ttl * 1000,
        });
        
        // Clean up expired entries periodically
        if (this.inMemoryCache.size > 100) {
          this.cleanupExpired();
        }
        return;
      }

      if (this.redis) {
        await this.redis.set(key, JSON.stringify(value), { ex: ttl });
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    try {
      if (this.useInMemory) {
        this.inMemoryCache.delete(key);
        return;
      }

      if (this.redis) {
        await this.redis.del(key);
      }
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    try {
      if (this.useInMemory) {
        this.inMemoryCache.clear();
        return;
      }

      if (this.redis) {
        await this.redis.flushall();
      }
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  /**
   * Clean up expired entries from in-memory cache
   */
  private cleanupExpired(): void {
    const now = Date.now();
    for (const [key, cached] of this.inMemoryCache.entries()) {
      if (cached.expiry <= now) {
        this.inMemoryCache.delete(key);
      }
    }
  }
}

export const cacheService = new CacheService();