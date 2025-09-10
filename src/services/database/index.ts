import type { CustomDeck, CustomFlashcard, UserDeck } from '@/types/flashcard';
import { CleanupOperations } from './cleanup-operations';
import { DeckOperations } from './deck-operations';
import { FlashcardOperations } from './flashcard-operations';
import { ProgressOperations } from './progress-operations';
import { DatabaseSchema } from './schema';
import { SyncOperations } from './sync-operations';

/**
 * Main LocalDatabase service that provides unified access to all database operations.
 * Implements offline-first architecture with sync capabilities.
 * 
 * Features:
 * - Modular architecture with separate operation classes
 * - Comprehensive error handling and logging
 * - Input validation using Zod schemas
 * - Transaction support for complex operations
 * - Sync queue management for offline-first architecture
 */

export class LocalDatabase {
  private schema: DatabaseSchema;
  private deckOps: DeckOperations;
  private flashcardOps: FlashcardOperations;
  private progressOps: ProgressOperations;
  private syncOps: SyncOperations;
  private cleanupOps: CleanupOperations;
  private isInitialized = false;

  constructor() {
    this.schema = new DatabaseSchema();
    this.deckOps = new DeckOperations();
    this.flashcardOps = new FlashcardOperations();
    this.progressOps = new ProgressOperations();
    this.syncOps = new SyncOperations();
    this.cleanupOps = new CleanupOperations();
  }

  // Database initialization
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('ℹ️ Database already initialized');
      return;
    }
    
    try {
      await this.schema.initialize();
      
      // Force fix any remaining deletion queue issues
      await this.forceFixDeletionQueue();
      
      this.isInitialized = true;
      console.log('✅ LocalDatabase service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize LocalDatabase service:', error);
      throw new Error(`Database initialization failed: ${error}`);
    }
  }

  /**
   * Force fix deletion queue table if it still has issues
   */
  private async forceFixDeletionQueue(): Promise<void> {
    try {
      // Test if the deletion queue table works properly by trying to get pending deletions
      await this.syncOps.getPendingDeletions();
      console.log('✅ Deletion queue table is working correctly');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      console.warn('⚠️ Deletion queue still has issues, but sync operations will handle it gracefully by returning empty arrays');
      // Don't throw - the sync operations are now resilient and will return empty arrays
    }
  }

  /**
   * Ensures database is initialized before operations
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  // Deck operations with enhanced error handling
  async insertUserDeck(deck: UserDeck): Promise<void> {
    await this.ensureInitialized();
    return this.deckOps.insertUserDeck(deck);
  }

  async insertCustomDeck(deck: CustomDeck): Promise<void> {
    await this.ensureInitialized();
    return this.deckOps.insertCustomDeck(deck);
  }

  async deleteUserDeck(userDeckId: string): Promise<void> {
    await this.ensureInitialized();
    return this.deckOps.deleteUserDeck(userDeckId);
  }

  async updateDeckFlashcardCount(userDeckId: string): Promise<void> {
    await this.ensureInitialized();
    return this.deckOps.updateDeckFlashcardCount(userDeckId);
  }

  async getUserDecks(userId: string): Promise<UserDeck[]> {
    await this.ensureInitialized();
    try {
      return await this.deckOps.getUserDecks(userId);
    } catch (error) {
      console.error(`❌ Failed to get user decks through main interface: ${error}`);
      // Return empty array to keep app functioning
      return [];
    }
  }

  async getCustomDeckById(id: string): Promise<CustomDeck | null> {
    await this.ensureInitialized();
    return this.deckOps.getCustomDeckById(id);
  }

  async updateDeckStats(userDeckId: string, deltas: { new?: number; learning?: number; review?: number; mastered?: number }): Promise<void> {
    await this.ensureInitialized();
    return this.deckOps.updateDeckStats(userDeckId, deltas);
  }

  async recalculateDeckStats(userDeckId: string): Promise<void> {
    await this.ensureInitialized();
    return this.deckOps.recalculateDeckStats(userDeckId);
  }

  async fixCustomDeckNames(): Promise<void> {
    await this.ensureInitialized();
    return this.deckOps.fixCustomDeckNames();
  }

  // Flashcard operations with enhanced type safety
  async insertCustomFlashcard(flashcard: CustomFlashcard): Promise<void> {
    await this.ensureInitialized();
    return this.flashcardOps.insertCustomFlashcard(flashcard);
  }

  async getTemplateFlashcards(templateDeckId: string): Promise<any[]> {
    await this.ensureInitialized();
    return this.flashcardOps.getTemplateFlashcards(templateDeckId);
  }

  async insertTemplateFlashcard(flashcard: any): Promise<void> {
    await this.ensureInitialized();
    return this.flashcardOps.insertTemplateFlashcard(flashcard);
  }

  async getCustomFlashcards(userDeckId: string): Promise<CustomFlashcard[]> {
    await this.ensureInitialized();
    return this.flashcardOps.getCustomFlashcards(userDeckId);
  }

  async clearCustomFlashcard(flashcardId: string): Promise<void> {
    await this.ensureInitialized();
    return this.flashcardOps.clearCustomFlashcard(flashcardId);
  }

  async updateFlashcardPosition(flashcardId: string, newPosition: number): Promise<void> {
    await this.ensureInitialized();
    return this.flashcardOps.updateFlashcardPosition(flashcardId, newPosition);
  }

  async updateMultipleFlashcardPositions(updates: Array<{ id: string; position: number }>): Promise<void> {
    await this.ensureInitialized();
    return this.flashcardOps.updateMultipleFlashcardPositions(updates);
  }

  // Progress operations with initialization checks
  async getStudyQueue(deckId: string): Promise<any[]> {
    await this.ensureInitialized();
    return this.progressOps.getStudyQueue(deckId);
  }

  async getDeckDueCount(deckId: string): Promise<number> {
    await this.ensureInitialized();
    return this.progressOps.getDeckDueCount(deckId);
  }

  async getAllProgressData(): Promise<any[]> {
    await this.ensureInitialized();
    return this.progressOps.getAllProgressData();
  }

  async upsertProgressData(progress: any): Promise<void> {
    await this.ensureInitialized();
    return this.progressOps.upsertProgressData(progress);
  }

  async applyAnswer(deckId: string, flashcardId: string, knew: boolean): Promise<void> {
    await this.ensureInitialized();
    return this.progressOps.applyAnswer(deckId, flashcardId, knew);
  }

  async cleanupOrphanedProgress(): Promise<void> {
    await this.ensureInitialized();
    return this.progressOps.cleanupOrphanedProgress();
  }

  async debugDeckStats(deckId: string, operation: string): Promise<void> {
    await this.ensureInitialized();
    return this.progressOps.debugDeckStats(deckId, operation);
  }

  // Enhanced sync operations with full sync capabilities
  async getUnsyncedItems(): Promise<{
    userDecks: any[];
    customDecks: any[];
    customFlashcards: any[];
    progress: any[];
  }> {
    await this.ensureInitialized();
    return this.syncOps.getUnsyncedItems();
  }

  async enqueueDeletion(entityType: 'deck' | 'flashcard', entityId: string): Promise<void> {
    await this.ensureInitialized();
    return this.syncOps.enqueueDeletion(entityType, entityId);
  }

  async getPendingDeletions(): Promise<Array<{entity_type: string, entity_id: string, record_id: string}>> {
    await this.ensureInitialized();
    try {
      return await this.syncOps.getPendingDeletions();
    } catch (error) {
      console.error(`❌ Failed to get pending deletions through main interface: ${error}`);
      // Return empty array to keep app functioning
      return [];
    }
  }

  async getDeletionQueue(): Promise<{ entity_type: string; entity_id: string }[]> {
    await this.ensureInitialized();
    try {
      return await this.syncOps.getDeletionQueue();
    } catch (error) {
      console.error(`❌ Failed to get deletion queue through main interface: ${error}`);
      // Return empty array to keep app functioning
      return [];
    }
  }

  async clearDeletion(entityType: 'deck' | 'flashcard', entityId: string): Promise<void> {
    await this.ensureInitialized();
    return this.syncOps.clearDeletion(entityType, entityId);
  }

  async markAsSynced(table: string, ids: string[]): Promise<void> {
    await this.ensureInitialized();
    return this.syncOps.markAsSynced(table, ids);
  }

  // New comprehensive sync methods
  async syncToCloud(): Promise<boolean> {
    await this.ensureInitialized();
    return this.syncOps.syncToCloud();
  }

  async syncDeletionsToCloud(): Promise<boolean> {
    await this.ensureInitialized();
    return this.syncOps.syncDeletionsToCloud();
  }

  async performFullSync(): Promise<{ success: boolean; synced: number; deleted: number }> {
    await this.ensureInitialized();
    return this.syncOps.performFullSync();
  }

  async syncFlashcardPositions(): Promise<{ success: boolean; synced: number; error?: string }> {
    await this.ensureInitialized();
    return this.syncOps.syncFlashcardPositions();
  }

  // Cleanup operations with safety checks
  async clearAllData(): Promise<void> {
    await this.ensureInitialized();
    return this.cleanupOps.clearAllData();
  }

  async clearAllDecks(userId: string): Promise<void> {
    await this.ensureInitialized();
    return this.cleanupOps.clearAllDecks(userId);
  }

  async debugShowAllDecks(userId: string): Promise<void> {
    await this.ensureInitialized();
    return this.cleanupOps.debugShowAllDecks(userId);
  }

  async clearCustomDeck(deckId: string): Promise<void> {
    await this.ensureInitialized();
    return this.cleanupOps.clearCustomDeck(deckId);
  }

  /**
   * Health check method to verify database integrity
   */
  async healthCheck(): Promise<{
    initialized: boolean;
    tablesExist: boolean;
    canQuery: boolean;
    deletionQueueWorking: boolean;
    error?: string;
  }> {
    try {
      await this.ensureInitialized();
      
      // Test basic query capability
      await this.deckOps.getUserDecks('health-check-test');
      
      // Test deletion queue functionality
      let deletionQueueWorking = true;
      try {
        await this.syncOps.getPendingDeletions();
      } catch (error) {
        deletionQueueWorking = false;
        console.warn('⚠️ Deletion queue not working:', error);
      }
      
      return {
        initialized: this.isInitialized,
        tablesExist: true,
        canQuery: true,
        deletionQueueWorking
      };
    } catch (error) {
      return {
        initialized: this.isInitialized,
        tablesExist: false,
        canQuery: false,
        deletionQueueWorking: false,
        error: String(error)
      };
    }
  }

  /**
   * Get database statistics for debugging
   */
  async getStats(): Promise<{
    userDecks: number;
    customDecks: number;
    customFlashcards: number;
    templateFlashcards: number;
    progressRecords: number;
    pendingSync: number;
    pendingDeletions: number;
    errors: string[];
  }> {
    await this.ensureInitialized();
    
    const errors: string[] = [];
    let unsyncedItems: {
      userDecks: any[];
      customDecks: any[];
      customFlashcards: any[];
      progress: any[];
    } = { userDecks: [], customDecks: [], customFlashcards: [], progress: [] };
    let pendingDeletions: any[] = [];
    
    try {
      unsyncedItems = await this.getUnsyncedItems();
    } catch (error) {
      errors.push(`Failed to get unsynced items: ${error}`);
    }
    
    try {
      pendingDeletions = await this.getPendingDeletions();
    } catch (error) {
      errors.push(`Failed to get pending deletions: ${error}`);
    }
    
    const totalPendingSync = unsyncedItems.userDecks.length + 
                            unsyncedItems.customDecks.length + 
                            unsyncedItems.customFlashcards.length + 
                            unsyncedItems.progress.length;
    
    return {
      userDecks: unsyncedItems.userDecks.length,
      customDecks: unsyncedItems.customDecks.length,
      customFlashcards: unsyncedItems.customFlashcards.length,
      templateFlashcards: 0, // TODO: Add template flashcard count
      progressRecords: unsyncedItems.progress.length,
      pendingSync: totalPendingSync,
      pendingDeletions: pendingDeletions.length,
      errors
    };
  }
}

export const localDatabase = new LocalDatabase();