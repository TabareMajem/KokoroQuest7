import { predefinedGames } from './predefinedGames';
import { api } from '../../lib/api';
import { logger } from '../../server/config/logger';

export async function loadPredefinedGames() {
  try {
    // Get existing games
    const { data: existingContent } = await api.get('/api/content', {
      params: { type: 'game' }
    });

    // Filter out games that already exist
    const newGames = predefinedGames.filter(game => 
      !existingContent.data.some((content: any) => 
        content.title === game.title
      )
    );

    // Create new games
    for (const game of newGames) {
      await api.post('/api/content', {
        ...game,
        status: 'published'
      });
    }

    logger.info(`Loaded ${newGames.length} predefined games`);
    return newGames.length;
  } catch (error) {
    logger.error('Failed to load predefined games:', error);
    throw new Error('Failed to load predefined games');
  }
}