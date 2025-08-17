const UNSPLASH_ACCESS_KEY = process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY;
const UNSPLASH_BASE_URL = 'https://api.unsplash.com';

export interface UnsplashImage {
  id: string;
  description: string | null;
  alt_description: string | null;
  urls: {
    regular: string;
    small: string;
    thumb: string;
  };
  user: {
    name: string;
    username: string;
  };
  download_url: string;
}

export interface UnsplashSearchResponse {
  results: UnsplashImage[];
  total: number;
  total_pages: number;
}

class UnsplashService {
  private async request<T>(endpoint: string, params: URLSearchParams = new URLSearchParams()): Promise<T> {
    if (!UNSPLASH_ACCESS_KEY) {
      throw new Error('Unsplash Access Key not configured');
    }

    const url = `${UNSPLASH_BASE_URL}${endpoint}?${params.toString()}`;
  
    const response = await fetch(url, {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        'Accept-Version': 'v1',
      },
    });

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async searchPhotos(
    query: string,
    page: number = 1,
    perPage: number = 20,
    orientation: 'landscape' | 'portrait' | 'squarish' = 'landscape'
  ): Promise<UnsplashSearchResponse> {
    const params = new URLSearchParams({
      query,
      page: page.toString(),
      per_page: perPage.toString(),
      orientation,
      content_filter: 'high', // Filter out inappropriate content
    });

    return this.request<UnsplashSearchResponse>('/search/photos', params);
  }

  async getFeaturedPhotos(
    page: number = 1,
    perPage: number = 20,
    orientation: 'landscape' | 'portrait' | 'squarish' = 'landscape'
  ): Promise<UnsplashImage[]> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      orientation,
    });

    return this.request<UnsplashImage[]>('/photos', params);
  }

  async triggerDownload(downloadUrl: string): Promise<void> {
    // This is required by Unsplash API terms - we need to trigger download tracking
    try {
      if (!UNSPLASH_ACCESS_KEY) {
        console.warn('Unsplash Access Key not configured, skipping download tracking');
        return;
      }

      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      });

      if (!response.ok) {
        console.warn(`Unsplash download tracking failed: ${response.status}`);
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Don't show warning for network failures - this is optional functionality
      console.log('Unsplash download tracking unavailable (offline or network issue)');
    }
  }

  // Get curated photos for specific categories that work well for flashcards
  async getFlashcardPhotos(
    category: 'education' | 'nature' | 'objects' | 'people' | 'food' | 'travel' = 'education',
    page: number = 1
  ): Promise<UnsplashSearchResponse> {
    const queries = {
      education: 'education learning study books',
      nature: 'nature landscape scenic',
      objects: 'objects items things minimal',
      people: 'people portrait person',
      food: 'food cooking cuisine',
      travel: 'travel destination culture',
    };

    return this.searchPhotos(queries[category], page, 12, 'squarish');
  }
}

export const unsplashService = new UnsplashService();