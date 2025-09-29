/**
 * Performance Data Cache and Persistence Utilities
 *
 * Provides caching and persistence strategies for performance monitoring data
 * with configurable storage backends and intelligent cache management.
 *
 * @fileoverview Task 6.3: Data caching and persistence strategies
 * @version 1.0.0
 * @since Task 6.3 - Data Collection Separation
 */

import type {
  RawPerformanceDataPoint,
  AggregatedPerformanceData
} from '../services/PerformanceDataCollectionService';

// ===== CACHE TYPES =====

/**
 * Cache configuration options
 */
export interface CacheConfig {
  enabled: boolean;
  maxSize: number; // Maximum number of items
  maxAge: number; // Maximum age in milliseconds
  persistenceEnabled: boolean;
  storageBackend: 'memory' | 'localStorage' | 'indexedDB';
  compressionEnabled: boolean;
  autoCleanupInterval: number; // ms
}

/**
 * Cache entry with metadata
 */
interface CacheEntry<T> {
  key: string;
  data: T;
  timestamp: number;
  size: number;
  accessCount: number;
  lastAccessed: number;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  oldestEntry: number;
  newestEntry: number;
  averageSize: number;
  memoryUsage: number;
}

// ===== PERFORMANCE DATA CACHE =====

/**
 * High-performance cache for monitoring data with intelligent eviction
 */
export class PerformanceDataCache {
  private config: CacheConfig;
  private cache = new Map<string, CacheEntry<any>>();
  private accessQueue: string[] = []; // LRU tracking
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    persistenceWrites: 0,
    persistenceReads: 0
  };
  private cleanupTimer: number | null = null;
  private indexedDB: IDBDatabase | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      enabled: true,
      maxSize: 1000,
      maxAge: 300000, // 5 minutes
      persistenceEnabled: false,
      storageBackend: 'memory',
      compressionEnabled: false,
      autoCleanupInterval: 60000, // 1 minute
      ...config
    };

    if (this.config.enabled) {
      this.initializeStorage();
      this.startCleanupTimer();
    }
  }

  // ===== CACHE OPERATIONS =====

  /**
   * Store data in cache
   */
  public set<T>(key: string, data: T): boolean {
    if (!this.config.enabled) return false;

    try {
      const entry: CacheEntry<T> = {
        key,
        data,
        timestamp: Date.now(),
        size: this.calculateSize(data),
        accessCount: 0,
        lastAccessed: Date.now()
      };

      // Check if we need to evict entries
      this.enforceMaxSize();

      // Store in memory cache
      this.cache.set(key, entry);
      this.updateAccessQueue(key);

      // Persist if enabled
      if (this.config.persistenceEnabled) {
        this.persistToStorage(key, entry);
      }

      return true;
    } catch (error) {
      console.warn('[DataCache] Failed to store data:', error);
      return false;
    }
  }

  /**
   * Retrieve data from cache
   */
  public get<T>(key: string): T | null {
    if (!this.config.enabled) return null;

    // Check memory cache first
    const entry = this.cache.get(key);
    if (entry) {
      // Check if entry is still valid
      if (this.isEntryValid(entry)) {
        entry.accessCount++;
        entry.lastAccessed = Date.now();
        this.updateAccessQueue(key);
        this.stats.hits++;
        return entry.data as T;
      } else {
        // Entry expired, remove it
        this.cache.delete(key);
      }
    }

    // Try to load from persistent storage
    if (this.config.persistenceEnabled) {
      const persistedData = this.loadFromStorage<T>(key);
      if (persistedData) {
        this.stats.hits++;
        this.stats.persistenceReads++;
        return persistedData;
      }
    }

    this.stats.misses++;
    return null;
  }

  /**
   * Check if key exists in cache
   */
  public has(key: string): boolean {
    if (!this.config.enabled) return false;

    const entry = this.cache.get(key);
    return entry !== undefined && this.isEntryValid(entry);
  }

  /**
   * Remove entry from cache
   */
  public delete(key: string): boolean {
    if (!this.config.enabled) return false;

    const deleted = this.cache.delete(key);
    this.removeFromAccessQueue(key);

    // Remove from persistent storage
    if (this.config.persistenceEnabled) {
      this.removeFromStorage(key);
    }

    return deleted;
  }

  /**
   * Clear all cache entries
   */
  public clear(): void {
    this.cache.clear();
    this.accessQueue = [];
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      persistenceWrites: 0,
      persistenceReads: 0
    };

    if (this.config.persistenceEnabled) {
      this.clearStorage();
    }
  }

  // ===== SPECIALIZED STORAGE METHODS =====

  /**
   * Store raw performance data points
   */
  public storeRawData(sessionId: string, dataPoints: RawPerformanceDataPoint[]): boolean {
    const key = `raw_${sessionId}_${Date.now()}`;
    return this.set(key, dataPoints);
  }

  /**
   * Store aggregated performance data
   */
  public storeAggregatedData(windowId: string, data: AggregatedPerformanceData): boolean {
    const key = `aggregated_${windowId}`;
    return this.set(key, data);
  }

  /**
   * Retrieve raw data for session
   */
  public getRawDataForSession(sessionId: string): RawPerformanceDataPoint[][] {
    const results: RawPerformanceDataPoint[][] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (key.startsWith(`raw_${sessionId}_`) && this.isEntryValid(entry)) {
        results.push(entry.data);
      }
    }

    return results;
  }

  /**
   * Retrieve aggregated data for time range
   */
  public getAggregatedDataForTimeRange(startTime: number, endTime: number): AggregatedPerformanceData[] {
    const results: AggregatedPerformanceData[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (key.startsWith('aggregated_') && this.isEntryValid(entry)) {
        const data = entry.data as AggregatedPerformanceData;
        if (data.timeWindow.start >= startTime && data.timeWindow.end <= endTime) {
          results.push(data);
        }
      }
    }

    return results.sort((a, b) => a.timeWindow.start - b.timeWindow.start);
  }

  /**
   * Get all cache keys matching pattern
   */
  public getKeysMatching(pattern: RegExp): string[] {
    return Array.from(this.cache.keys()).filter(key => pattern.test(key));
  }

  // ===== CACHE MANAGEMENT =====

  /**
   * Enforce maximum cache size using LRU eviction
   */
  private enforceMaxSize(): void {
    while (this.cache.size >= this.config.maxSize) {
      // Find least recently used entry
      const lruKey = this.accessQueue[0];
      if (lruKey && this.cache.has(lruKey)) {
        this.cache.delete(lruKey);
        this.removeFromAccessQueue(lruKey);
        this.stats.evictions++;
      } else {
        // Queue is out of sync, rebuild it
        this.rebuildAccessQueue();
        break;
      }
    }
  }

  /**
   * Check if cache entry is still valid
   */
  private isEntryValid(entry: CacheEntry<any>): boolean {
    const age = Date.now() - entry.timestamp;
    return age <= this.config.maxAge;
  }

  /**
   * Update LRU access queue
   */
  private updateAccessQueue(key: string): void {
    this.removeFromAccessQueue(key);
    this.accessQueue.push(key);
  }

  /**
   * Remove key from access queue
   */
  private removeFromAccessQueue(key: string): void {
    const index = this.accessQueue.indexOf(key);
    if (index !== -1) {
      this.accessQueue.splice(index, 1);
    }
  }

  /**
   * Rebuild access queue from cache entries
   */
  private rebuildAccessQueue(): void {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
    this.accessQueue = entries.map(([key]) => key);
  }

  /**
   * Calculate approximate size of data
   */
  private calculateSize(data: any): number {
    try {
      return JSON.stringify(data).length;
    } catch {
      return 1000; // Fallback estimate
    }
  }

  /**
   * Cleanup expired entries
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.config.maxAge) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.cache.delete(key);
      this.removeFromAccessQueue(key);
    }

    if (expiredKeys.length > 0) {
      console.log(`[DataCache] Cleaned up ${expiredKeys.length} expired entries`);
    }
  }

  /**
   * Start automatic cleanup timer
   */
  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = window.setInterval(() => {
      this.cleanupExpiredEntries();
    }, this.config.autoCleanupInterval);
  }

  /**
   * Stop automatic cleanup timer
   */
  private stopCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  // ===== STORAGE BACKENDS =====

  /**
   * Initialize storage backend
   */
  private async initializeStorage(): Promise<void> {
    if (!this.config.persistenceEnabled) return;

    switch (this.config.storageBackend) {
      case 'indexedDB':
        await this.initializeIndexedDB();
        break;
      case 'localStorage':
        // localStorage is available by default
        break;
      case 'memory':
      default:
        // Memory storage is the default
        break;
    }
  }

  /**
   * Initialize IndexedDB
   */
  private async initializeIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        console.warn('[DataCache] IndexedDB not supported, falling back to memory storage');
        this.config.storageBackend = 'memory';
        resolve();
        return;
      }

      const request = indexedDB.open('PerformanceDataCache', 1);

      request.onerror = () => {
        console.warn('[DataCache] IndexedDB initialization failed:', request.error);
        this.config.storageBackend = 'memory';
        resolve();
      };

      request.onsuccess = () => {
        this.indexedDB = request.result;
        resolve();
      };

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('cache')) {
          const objectStore = db.createObjectStore('cache', { keyPath: 'key' });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * Persist entry to storage
   */
  private async persistToStorage(key: string, entry: CacheEntry<any>): Promise<void> {
    try {
      switch (this.config.storageBackend) {
        case 'localStorage':
          this.persistToLocalStorage(key, entry);
          break;
        case 'indexedDB':
          await this.persistToIndexedDB(key, entry);
          break;
        default:
          // Memory storage doesn't need persistence
          break;
      }
      this.stats.persistenceWrites++;
    } catch (error) {
      console.warn('[DataCache] Failed to persist to storage:', error);
    }
  }

  /**
   * Persist to localStorage
   */
  private persistToLocalStorage(key: string, entry: CacheEntry<any>): void {
    try {
      const storageKey = `perf_cache_${key}`;
      const data = this.config.compressionEnabled
        ? this.compressData(JSON.stringify(entry))
        : JSON.stringify(entry);
      localStorage.setItem(storageKey, data);
    } catch (error) {
      console.warn('[DataCache] localStorage persistence failed:', error);
    }
  }

  /**
   * Persist to IndexedDB
   */
  private async persistToIndexedDB(key: string, entry: CacheEntry<any>): Promise<void> {
    if (!this.indexedDB) return;

    return new Promise((resolve, reject) => {
      const transaction = this.indexedDB!.transaction(['cache'], 'readwrite');
      const objectStore = transaction.objectStore('cache');
      const request = objectStore.put({ ...entry, key });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Load from storage
   */
  private loadFromStorage<T>(key: string): T | null {
    try {
      switch (this.config.storageBackend) {
        case 'localStorage':
          return this.loadFromLocalStorage<T>(key);
        case 'indexedDB':
          // IndexedDB requires async, not suitable for sync get() method
          return null;
        default:
          return null;
      }
    } catch (error) {
      console.warn('[DataCache] Failed to load from storage:', error);
      return null;
    }
  }

  /**
   * Load from localStorage
   */
  private loadFromLocalStorage<T>(key: string): T | null {
    try {
      const storageKey = `perf_cache_${key}`;
      const data = localStorage.getItem(storageKey);
      if (!data) return null;

      const parsedData = this.config.compressionEnabled
        ? JSON.parse(this.decompressData(data))
        : JSON.parse(data);

      // Check if entry is still valid
      if (this.isEntryValid(parsedData)) {
        return parsedData.data as T;
      } else {
        // Remove expired entry
        localStorage.removeItem(storageKey);
        return null;
      }
    } catch (error) {
      console.warn('[DataCache] localStorage load failed:', error);
      return null;
    }
  }

  /**
   * Remove from storage
   */
  private removeFromStorage(key: string): void {
    try {
      switch (this.config.storageBackend) {
        case 'localStorage':
          localStorage.removeItem(`perf_cache_${key}`);
          break;
        case 'indexedDB':
          if (this.indexedDB) {
            const transaction = this.indexedDB.transaction(['cache'], 'readwrite');
            const objectStore = transaction.objectStore('cache');
            objectStore.delete(key);
          }
          break;
      }
    } catch (error) {
      console.warn('[DataCache] Failed to remove from storage:', error);
    }
  }

  /**
   * Clear storage
   */
  private clearStorage(): void {
    try {
      switch (this.config.storageBackend) {
        case 'localStorage':
          // Remove all performance cache keys
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && key.startsWith('perf_cache_')) {
              localStorage.removeItem(key);
            }
          }
          break;
        case 'indexedDB':
          if (this.indexedDB) {
            const transaction = this.indexedDB.transaction(['cache'], 'readwrite');
            const objectStore = transaction.objectStore('cache');
            objectStore.clear();
          }
          break;
      }
    } catch (error) {
      console.warn('[DataCache] Failed to clear storage:', error);
    }
  }

  // ===== COMPRESSION UTILITIES =====

  /**
   * Simple compression for localStorage
   */
  private compressData(data: string): string {
    // Simple LZ-string style compression
    // In production, use a proper compression library
    return btoa(encodeURIComponent(data));
  }

  /**
   * Simple decompression for localStorage
   */
  private decompressData(data: string): string {
    try {
      return decodeURIComponent(atob(data));
    } catch {
      return data; // Fallback to original data
    }
  }

  // ===== STATISTICS AND MONITORING =====

  /**
   * Get cache statistics
   */
  public getStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);
    const timestamps = entries.map(entry => entry.timestamp);

    return {
      totalEntries: this.cache.size,
      totalSize,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
      oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : 0,
      newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : 0,
      averageSize: totalSize / this.cache.size || 0,
      memoryUsage: totalSize
    };
  }

  /**
   * Get detailed cache information
   */
  public getCacheInfo(): {
    config: CacheConfig;
    stats: typeof this.stats;
    cacheStats: CacheStats;
  } {
    return {
      config: this.config,
      stats: this.stats,
      cacheStats: this.getStats()
    };
  }

  /**
   * Cleanup and shutdown cache
   */
  public destroy(): void {
    this.stopCleanupTimer();
    this.clear();

    if (this.indexedDB) {
      this.indexedDB.close();
      this.indexedDB = null;
    }
  }
}

// ===== SINGLETON INSTANCE =====

let cacheInstance: PerformanceDataCache | null = null;

/**
 * Get singleton cache instance
 */
export function getPerformanceDataCache(config?: Partial<CacheConfig>): PerformanceDataCache {
  if (!cacheInstance) {
    cacheInstance = new PerformanceDataCache(config);
  }
  return cacheInstance;
}

/**
 * Reset cache instance (for testing)
 */
export function resetPerformanceDataCache(): void {
  if (cacheInstance) {
    cacheInstance.destroy();
  }
  cacheInstance = null;
}

export default {
  PerformanceDataCache,
  getPerformanceDataCache,
  resetPerformanceDataCache
};