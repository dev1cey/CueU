/**
 * APA Handicap System Utilities
 * Based on the APA handicap chart where skill levels range from 2-7
 */

/**
 * Get the racks needed to win for each player based on their skill levels
 * @param player1SkillLevel Skill level of player 1 (2-7)
 * @param player2SkillLevel Skill level of player 2 (2-7)
 * @returns Object with racks needed for each player
 */
export function getRacksNeeded(
  player1SkillLevel: number,
  player2SkillLevel: number
): { player1: number; player2: number } {
  // Validate skill levels
  if (player1SkillLevel < 2 || player1SkillLevel > 7 || 
      player2SkillLevel < 2 || player2SkillLevel > 7) {
    throw new Error('Skill levels must be between 2 and 7');
  }

  // APA Handicap Chart
  // The chart shows the racks needed based on the matchup
  // Format: [player1Level][player2Level] = player1Racks/player2Racks
  const handicapChart: Record<number, Record<number, { player1: number; player2: number }>> = {
    2: {
      2: { player1: 2, player2: 2 },
      3: { player1: 2, player2: 3 },
      4: { player1: 2, player2: 4 },
      5: { player1: 2, player2: 5 },
      6: { player1: 2, player2: 6 },
      7: { player1: 2, player2: 7 },
    },
    3: {
      2: { player1: 3, player2: 2 },
      3: { player1: 2, player2: 2 },
      4: { player1: 2, player2: 3 },
      5: { player1: 2, player2: 4 },
      6: { player1: 2, player2: 5 },
      7: { player1: 2, player2: 6 },
    },
    4: {
      2: { player1: 4, player2: 2 },
      3: { player1: 3, player2: 2 },
      4: { player1: 3, player2: 3 },
      5: { player1: 3, player2: 4 },
      6: { player1: 3, player2: 5 },
      7: { player1: 2, player2: 5 },
    },
    5: {
      2: { player1: 5, player2: 2 },
      3: { player1: 4, player2: 2 },
      4: { player1: 4, player2: 3 },
      5: { player1: 4, player2: 4 },
      6: { player1: 4, player2: 5 },
      7: { player1: 3, player2: 5 },
    },
    6: {
      2: { player1: 6, player2: 2 },
      3: { player1: 5, player2: 2 },
      4: { player1: 5, player2: 3 },
      5: { player1: 5, player2: 4 },
      6: { player1: 5, player2: 5 },
      7: { player1: 4, player2: 5 },
    },
    7: {
      2: { player1: 7, player2: 2 },
      3: { player1: 6, player2: 2 },
      4: { player1: 5, player2: 2 },
      5: { player1: 5, player2: 3 },
      6: { player1: 5, player2: 4 },
      7: { player1: 5, player2: 5 },
    },
  };

  return handicapChart[player1SkillLevel][player2SkillLevel];
}

/**
 * Calculate points earned from a match
 * Winner gets 10 points, loser gets 10 * (racks won / racks needed)
 * @param isWinner Whether the player won the match
 * @param racksWon Number of racks the player won
 * @param racksNeeded Number of racks needed to win
 * @returns Points earned (0-10)
 */
export function calculateMatchPoints(
  isWinner: boolean,
  racksWon: number,
  racksNeeded: number
): number {
  if (isWinner) {
    return 10;
  }
  
  if (racksNeeded === 0) {
    return 0;
  }
  
  return 10 * (racksWon / racksNeeded);
}

