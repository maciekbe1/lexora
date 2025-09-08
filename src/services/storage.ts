import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../../lib/supabase';

export class StorageService {
  private bucketName = 'flashcard-images';

  /**
   * Upload image from device URI to Supabase Storage
   */
  async uploadImageFromDevice(uri: string, fileName: string, userId: string): Promise<string> {
    try {
      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Get file extension
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const mimeType = this.getMimeType(fileExt);
      
      // Create unique file path
      const filePath = `${userId}/${Date.now()}_${fileName}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(filePath, decode(base64), {
          contentType: mimeType,
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(data.path);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  }

  /**
   * Upload Unsplash image by downloading and re-uploading to our storage
   */
  async uploadUnsplashImage(unsplashUrl: string, fileName: string, userId: string): Promise<string> {
    try {
      // Download image from Unsplash
      const response = await fetch(unsplashUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch image from Unsplash');
      }

      const arrayBuffer = await response.arrayBuffer();
      
      // Create unique file path
      const filePath = `${userId}/${Date.now()}_${fileName}.jpg`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(filePath, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(data.path);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error uploading Unsplash image:', error);
      throw new Error('Failed to upload Unsplash image');
    }
  }

  /**
   * Delete image from storage
   */
  async deleteImage(publicUrl: string): Promise<void> {
    try {
      // Extract path from public URL
      const path = this.extractPathFromUrl(publicUrl);
      if (!path) return;

      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([path]);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }

  /**
   * Get MIME type from file extension
   */
  private getMimeType(fileExt: string): string {
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
    };

    return mimeTypes[fileExt] || 'image/jpeg';
  }

  /**
   * Extract storage path from public URL
   */
  private extractPathFromUrl(publicUrl: string): string | null {
    try {
      const url = new URL(publicUrl);
      const pathSegments = url.pathname.split('/');
      const bucketIndex = pathSegments.findIndex(segment => segment === this.bucketName);
      
      if (bucketIndex === -1) return null;
      
      return pathSegments.slice(bucketIndex + 1).join('/');
    } catch {
      return null;
    }
  }

  /**
   * Check if storage bucket exists - bucket should be created via migration script
   */
  async initializeStorage(): Promise<void> {
    try {
      // Just check if bucket exists, don't try to create it
      // The bucket should be created by the database migration script
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === this.bucketName);

      if (!bucketExists) {
        console.log(`Storage bucket '${this.bucketName}' not found in bucket list (may be a permissions issue)`);
      } else {
        console.log(`Storage bucket '${this.bucketName}' is available`);
      }
    } catch (error) {
      console.error('Error checking storage bucket:', error);
    }
  }
}

export const storageService = new StorageService();