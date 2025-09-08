import * as SQLite from 'expo-sqlite';

export abstract class BaseDatabaseService {
  protected db: SQLite.SQLiteDatabase | null = null;

  protected async getDb(): Promise<SQLite.SQLiteDatabase> {
    if (!this.db) {
      this.db = await SQLite.openDatabaseAsync('lexora_local.db');
    }
    return this.db;
  }
}