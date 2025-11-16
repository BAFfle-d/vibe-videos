import axios from 'axios';
import type { PexelsSearchResponse, PexelsVideo, TagCount, TagCombination, Orientation } from '@/types';

const PEXELS_API_KEY = process.env.NEXT_PUBLIC_PEXELS_API_KEY!;
const PEXELS_API_BASE = 'https://api.pexels.com/videos';

export class PexelsService {
  private apiKey: string;

  constructor(apiKey: string = PEXELS_API_KEY) {
    this.apiKey = apiKey;
  }

  /**
   * Search for videos by a single tag
   */
  async searchByTag(
    tag: string, 
    orientation: Orientation = 'horizontal',
    perPage: number = 80,
    page: number = 1
  ): Promise<PexelsSearchResponse> {
    try {
      const response = await axios.get(`${PEXELS_API_BASE}/search`, {
        headers: {
          Authorization: this.apiKey,
        },
        params: {
          query: tag,
          orientation: orientation === 'horizontal' ? 'landscape' : 'portrait',
          per_page: perPage,
          page,
        },
      });

      return response.data;
    } catch (error) {
      console.error(`Error searching Pexels for tag "${tag}":`, error);
      throw error;
    }
  }

  /**
   * Get count of available videos for a single tag
   */
  async getTagCount(tag: string, orientation: Orientation = 'horizontal'): Promise<number> {
    try {
      const response = await this.searchByTag(tag, orientation, 1, 1);
      return response.total_results;
    } catch (error) {
      console.error(`Error getting count for tag "${tag}":`, error);
      return 0;
    }
  }

  /**
   * Get counts for multiple tags
   */
  async getTagCounts(tags: string[], orientation: Orientation = 'horizontal'): Promise<TagCount[]> {
    const counts = await Promise.all(
      tags.map(async (tag) => ({
        tag,
        count: await this.getTagCount(tag, orientation),
      }))
    );

    return counts.sort((a, b) => b.count - a.count);
  }

  /**
   * Get counts for tag combinations (2-5 tags)
   */
  async getTagCombinationCounts(
    tags: string[],
    orientation: Orientation = 'horizontal'
  ): Promise<TagCombination[]> {
    const combinations: TagCombination[] = [];

    // 5-tag combination
    if (tags.length === 5) {
      const query = tags.join(' ');
      const count = await this.getTagCount(query, orientation);
      combinations.push({ tags: [...tags], count });
    }

    // 4-tag combinations
    if (tags.length >= 4) {
      for (let i = 0; i < tags.length; i++) {
        const combo = tags.filter((_, idx) => idx !== i);
        if (combo.length === 4) {
          const query = combo.join(' ');
          const count = await this.getTagCount(query, orientation);
          combinations.push({ tags: combo, count });
        }
      }
    }

    // 3-tag combinations
    if (tags.length >= 3) {
      for (let i = 0; i < tags.length; i++) {
        for (let j = i + 1; j < tags.length; j++) {
          const combo = tags.filter((_, idx) => idx !== i && idx !== j);
          if (combo.length === 3) {
            const query = combo.join(' ');
            const count = await this.getTagCount(query, orientation);
            combinations.push({ tags: combo, count });
          }
        }
      }
    }

    // 2-tag combinations
    if (tags.length >= 2) {
      for (let i = 0; i < tags.length; i++) {
        for (let j = i + 1; j < tags.length; j++) {
          const combo = [tags[i], tags[j]];
          const query = combo.join(' ');
          const count = await this.getTagCount(query, orientation);
          combinations.push({ tags: combo, count });
        }
      }
    }

    return combinations.sort((a, b) => b.count - a.count);
  }

  /**
   * Calculate total available videos across all tag combinations
   */
  async getTotalAvailableVideos(
    tags: string[],
    orientation: Orientation = 'horizontal'
  ): Promise<number> {
    const tagCounts = await this.getTagCounts(tags, orientation);
    
    // Sum up all individual tag counts (this gives us a rough estimate)
    // In reality, there will be overlap, but this ensures we have enough diversity
    const total = tagCounts.reduce((sum, { count }) => sum + count, 0);
    
    return total;
  }

  /**
   * Fetch videos distributed across tag combinations for diversity
   */
  async fetchVideosWithDiversity(
    tags: string[],
    orientation: Orientation,
    totalNeeded: number,
    minClipDuration: number = 2,
    maxClipDuration: number = 10
  ): Promise<PexelsVideo[]> {
    const videos: PexelsVideo[] = [];
    const seenIds = new Set<number>();

    // Strategy: Fetch from different tag combinations to ensure diversity
    // Priority: 5 tags > 4 tags > 3 tags > 2 tags > 1 tag

    const tagCombinations = this.generateTagCombinations(tags);
    
    // Calculate how many videos to fetch from each combination tier
    const distribution = this.calculateDistribution(totalNeeded, tagCombinations.length);

    for (let i = 0; i < tagCombinations.length && videos.length < totalNeeded; i++) {
      const combo = tagCombinations[i];
      const needed = distribution[i];
      
      if (needed === 0) continue;

      try {
        const query = combo.join(' ');
        const response = await this.searchByTag(query, orientation, Math.min(needed * 2, 80));
        
        // Filter videos by duration and uniqueness
        const validVideos = response.videos.filter(
          (video) =>
            video.duration >= minClipDuration &&
            video.duration <= maxClipDuration &&
            !seenIds.has(video.id)
        );

        // Add videos to collection
        for (const video of validVideos) {
          if (videos.length >= totalNeeded) break;
          videos.push({ ...video, tags: combo });
          seenIds.add(video.id);
        }
      } catch (error) {
        console.error(`Error fetching videos for combination ${combo}:`, error);
      }
    }

    return videos;
  }

  /**
   * Generate tag combinations from most specific to least specific
   */
  private generateTagCombinations(tags: string[]): string[][] {
    const combinations: string[][] = [];

    // 5 tags
    if (tags.length === 5) {
      combinations.push([...tags]);
    }

    // 4 tags
    if (tags.length >= 4) {
      for (let i = 0; i < tags.length; i++) {
        const combo = tags.filter((_, idx) => idx !== i);
        if (combo.length === 4) {
          combinations.push(combo);
        }
      }
    }

    // 3 tags
    if (tags.length >= 3) {
      for (let i = 0; i < tags.length; i++) {
        for (let j = i + 1; j < tags.length; j++) {
          const combo = tags.filter((_, idx) => idx !== i && idx !== j);
          if (combo.length === 3) {
            combinations.push(combo);
          }
        }
      }
    }

    // 2 tags
    for (let i = 0; i < tags.length; i++) {
      for (let j = i + 1; j < tags.length; j++) {
        combinations.push([tags[i], tags[j]]);
      }
    }

    // 1 tag
    for (const tag of tags) {
      combinations.push([tag]);
    }

    return combinations;
  }

  /**
   * Calculate distribution of videos across tag combinations
   * Ensures diversity by requiring minimum percentage from each tier
   */
  private calculateDistribution(totalNeeded: number, numCombinations: number): number[] {
    const distribution: number[] = [];
    
    // Allocate more to higher-specificity combinations
    // But ensure we get some from each tier for diversity
    const weights = [];
    let currentWeight = 1.0;
    
    for (let i = 0; i < numCombinations; i++) {
      weights.push(currentWeight);
      currentWeight *= 0.7; // Each tier gets 70% of previous tier's weight
    }

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    for (const weight of weights) {
      const allocated = Math.ceil((weight / totalWeight) * totalNeeded);
      distribution.push(allocated);
    }

    return distribution;
  }

  /**
   * Get AI-suggested tags based on audio mood and tempo
   */
  getSuggestedTags(mood: string, tempo: number): string[] {
    const suggestions: Record<string, string[]> = {
      energetic: ['dance floor', 'party', 'neon lights', 'festival', 'city skyline', 'fireworks', 'crowd', 'lights'],
      upbeat: ['sunny', 'beach', 'happy people', 'celebration', 'nature', 'outdoors', 'summer', 'fun'],
      calm: ['nature', 'ocean', 'sunset', 'clouds', 'peaceful', 'meditation', 'forest', 'zen'],
      melancholic: ['rain', 'winter', 'alone', 'contemplative', 'city night', 'black and white', 'empty'],
      intense: ['storm', 'action', 'sports', 'dramatic', 'urban', 'industrial', 'power', 'motion'],
    };

    // Add tempo-based tags
    const tempoTags: string[] = [];
    if (tempo > 140) {
      tempoTags.push('fast motion', 'rapid', 'energy');
    } else if (tempo > 100) {
      tempoTags.push('dynamic', 'movement', 'flowing');
    } else {
      tempoTags.push('slow motion', 'gentle', 'serene');
    }

    const baseTags = suggestions[mood] || suggestions.upbeat;
    const allTags = [...baseTags, ...tempoTags];

    // Return 8 random suggestions
    return allTags.sort(() => Math.random() - 0.5).slice(0, 8);
  }
}
