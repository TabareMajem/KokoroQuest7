import { useState } from 'react';
import { api } from '../lib/api';
import { predefinedGames } from '../services/games/predefinedGames';
import type { Content } from '../types/content';

export function useContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listContent = async (params?: {
    type?: string;
    category?: string;
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);

      // In development, return mock data including predefined games
      if (import.meta.env.DEV) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        
        // Convert predefined games to Content type
        const games = predefinedGames.map((game, index) => ({
          id: `game-${index + 1}`,
          ...game,
          status: 'published' as const,
          version: 1,
          createdBy: 'admin',
          createdAt: new Date(),
          updatedAt: new Date()
        })) as Content[];

        // Filter based on params
        let filtered = games;
        if (params?.type) {
          filtered = filtered.filter(content => content.type === params.type);
        }
        if (params?.category) {
          filtered = filtered.filter(content => content.category === params.category);
        }
        if (params?.search) {
          const search = params.search.toLowerCase();
          filtered = filtered.filter(content => 
            content.title.toLowerCase().includes(search) ||
            content.description.toLowerCase().includes(search)
          );
        }

        return filtered;
      }

      const { data } = await api.get('/api/content', { params });
      return data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch content';
      setError(message);
      return []; // Return empty array instead of throwing
    } finally {
      setIsLoading(false);
    }
  };

  // Rest of the code remains the same...
  return {
    listContent,
    createContent,
    updateContent,
    deleteContent,
    isLoading,
    error
  };
}