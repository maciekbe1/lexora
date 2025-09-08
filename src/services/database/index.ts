import { DatabaseSchema } from './schema';
import { DeckOperations } from './deck-operations';
import { FlashcardOperations } from './flashcard-operations';
import { ProgressOperations } from './progress-operations';
import { SyncOperations } from './sync-operations';
import { CleanupOperations } from './cleanup-operations';

export class LocalDatabase {
  private schema: DatabaseSchema;
  private deckOps: DeckOperations;
  private flashcardOps: FlashcardOperations;
  private progressOps: ProgressOperations;
  private syncOps: SyncOperations;
  private cleanupOps: CleanupOperations;

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
    return this.schema.initialize();
  }

  // Deck operations
  async insertUserDeck(deck: any): Promise<void> {
    return this.deckOps.insertUserDeck(deck);
  }

  async insertCustomDeck(deck: any): Promise<void> {
    return this.deckOps.insertCustomDeck(deck);
  }

  async deleteUserDeck(userDeckId: string): Promise<void> {
    return this.deckOps.deleteUserDeck(userDeckId);
  }

  async updateDeckFlashcardCount(userDeckId: string): Promise<void> {
    return this.deckOps.updateDeckFlashcardCount(userDeckId);
  }

  async getUserDecks(userId: string): Promise<any[]> {
    return this.deckOps.getUserDecks(userId);
  }

  async getCustomDeckById(id: string): Promise<any> {
    return this.deckOps.getCustomDeckById(id);
  }

  async updateDeckStats(userDeckId: string, deltas: any): Promise<void> {
    return this.deckOps.updateDeckStats(userDeckId, deltas);
  }

  async recalculateDeckStats(userDeckId: string): Promise<void> {
    return this.deckOps.recalculateDeckStats(userDeckId);
  }

  async fixCustomDeckNames(): Promise<void> {
    return this.deckOps.fixCustomDeckNames();
  }

  // Flashcard operations
  async insertCustomFlashcard(flashcard: any): Promise<void> {
    return this.flashcardOps.insertCustomFlashcard(flashcard);
  }

  async getTemplateFlashcards(templateDeckId: string): Promise<any[]> {
    return this.flashcardOps.getTemplateFlashcards(templateDeckId);
  }

  async insertTemplateFlashcard(flashcard: any): Promise<void> {
    return this.flashcardOps.insertTemplateFlashcard(flashcard);
  }

  async getCustomFlashcards(userDeckId: string): Promise<any[]> {
    return this.flashcardOps.getCustomFlashcards(userDeckId);
  }

  async clearCustomFlashcard(flashcardId: string): Promise<void> {
    return this.flashcardOps.clearCustomFlashcard(flashcardId);
  }

  // Progress operations
  async getStudyQueue(deckId: string): Promise<any[]> {
    return this.progressOps.getStudyQueue(deckId);
  }

  async getDeckDueCount(deckId: string): Promise<number> {
    return this.progressOps.getDeckDueCount(deckId);
  }

  async getAllProgressData(): Promise<any[]> {
    return this.progressOps.getAllProgressData();
  }

  async upsertProgressData(progress: any): Promise<void> {
    return this.progressOps.upsertProgressData(progress);
  }

  async applyAnswer(deckId: string, flashcardId: string, knew: boolean): Promise<void> {
    return this.progressOps.applyAnswer(deckId, flashcardId, knew);
  }

  async cleanupOrphanedProgress(): Promise<void> {
    return this.progressOps.cleanupOrphanedProgress();
  }

  async debugDeckStats(deckId: string, operation: string): Promise<void> {
    return this.progressOps.debugDeckStats(deckId, operation);
  }

  // Sync operations
  async getUnsyncedItems(): Promise<any> {
    return this.syncOps.getUnsyncedItems();
  }

  async enqueueDeletion(entityType: 'deck' | 'flashcard', entityId: string): Promise<void> {
    return this.syncOps.enqueueDeletion(entityType, entityId);
  }

  async getPendingDeletions(): Promise<any[]> {
    return this.syncOps.getPendingDeletions();
  }

  async getDeletionQueue(): Promise<any[]> {
    return this.syncOps.getDeletionQueue();
  }

  async clearDeletion(entityType: 'deck' | 'flashcard', entityId: string): Promise<void> {
    return this.syncOps.clearDeletion(entityType, entityId);
  }

  async markAsSynced(table: string, ids: string[]): Promise<void> {
    return this.syncOps.markAsSynced(table, ids);
  }

  // Cleanup operations
  async clearAllData(): Promise<void> {
    return this.cleanupOps.clearAllData();
  }

  async clearAllDecks(userId: string): Promise<void> {
    return this.cleanupOps.clearAllDecks(userId);
  }

  async debugShowAllDecks(userId: string): Promise<void> {
    return this.cleanupOps.debugShowAllDecks(userId);
  }

  async clearCustomDeck(deckId: string): Promise<void> {
    return this.cleanupOps.clearCustomDeck(deckId);
  }
}

export const localDatabase = new LocalDatabase();