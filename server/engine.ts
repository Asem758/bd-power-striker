import { 
  Player, 
  Match, 
  RatingConfig, 
  RatingBreakdown, 
  PlayerRanking, 
  AuditLog,
  RankMovement
} from '../src/types';

/**
 * Calculates a player's official BDPSC Rating and returns a transparent breakdown.
 * Formula is fully transparent and based on admin-configurable coefficients.
 */
export function calculatePlayerRating(
  player: Player,
  matches: Match[],
  config: RatingConfig
): { rating: number; breakdown: RatingBreakdown } {
  // Find all matches where the player participated
  const playerMatches = matches.filter(m => 
    m.playerStats.some(ps => ps.playerId === player.id)
  );

  const totalMatchesCount = playerMatches.length;

  if (totalMatchesCount === 0) {
    const defaultBreakdown: RatingBreakdown = {
      basePerformance: config.baseRating,
      winContribution: 0,
      goalContribution: 0,
      assistContribution: 0,
      defensiveContribution: 0,
      motmBonus: 0,
      opponentModifier: 0,
      tournamentBonus: 0,
      recentFormModifier: 0,
      totalCalculatedRating: config.baseRating,
    };
    return { rating: config.baseRating, breakdown: defaultBreakdown };
  }

  // 1. Base performance
  const basePerformance = config.baseRating;

  // 2. Win Contribution: win rate scaled by winWeight (up to winWeight points)
  let wins = 0;
  let playerGoals = 0;
  let playerAssists = 0;
  let playerCleanSheets = 0;
  let motmCount = 0;
  let opponentStrengthSum = 0;

  for (const match of playerMatches) {
    const stat = match.playerStats.find(ps => ps.playerId === player.id);
    if (!stat) continue;

    if (match.result === 'WIN') wins++;
    playerGoals += stat.goals;
    playerAssists += stat.assists;
    if (stat.cleanSheet) playerCleanSheets++;
    if (stat.motm) motmCount++;
    opponentStrengthSum += (match.opponentStrength || 75);
  }

  const winRateRatio = totalMatchesCount > 0 ? (wins / totalMatchesCount) : 0;
  const winContribution = Math.round((winRateRatio * config.winWeight) * 10) / 10;

  // 3. Goal Contribution: capped/scaled so it contributes proportionally
  const goalsPerMatch = playerGoals / totalMatchesCount;
  const goalContribution = Math.round(Math.min(12, goalsPerMatch * config.goalWeight * 2.5) * 10) / 10;

  // 4. Assist Contribution
  const assistsPerMatch = playerAssists / totalMatchesCount;
  const assistContribution = Math.round(Math.min(8, assistsPerMatch * config.assistWeight * 2.5) * 10) / 10;

  // 5. Defensive Contribution (especially rewards CB and GK)
  const isDefenderOrGK = player.position === 'CB' || player.position === 'GK' || player.position === 'LB' || player.position === 'RB' || player.position === 'DMF';
  const cleanSheetRatio = totalMatchesCount > 0 ? (playerCleanSheets / totalMatchesCount) : 0;
  const defensiveMultiplier = isDefenderOrGK ? 2.5 : 1.0;
  const defensiveContribution = Math.round(Math.min(10, cleanSheetRatio * config.cleanSheetWeight * defensiveMultiplier) * 10) / 10;

  // 6. MOTM Bonus
  const motmRatio = totalMatchesCount > 0 ? (motmCount / totalMatchesCount) : 0;
  const motmBonus = Math.round(Math.min(8, motmRatio * config.motmWeight * 4) * 10) / 10;

  // 7. Opponent Strength Modifier (scale from baseline of 75)
  const avgOpponentStrength = opponentStrengthSum / totalMatchesCount;
  const opponentModifier = Math.round(Math.max(-3, Math.min(5, (avgOpponentStrength - 75) * config.opponentStrengthWeight)) * 10) / 10;

  // 8. Tournament Bonus
  // Give a weighted bump for major tournament appearances
  const tournamentBonus = Math.round((config.tournamentMultiplier.Major - 1.0) * 6 * 10) / 10;

  // 9. Recent Form Modifier (Last 5 matches: W=+3, D=+1, L=-1)
  const sortedMatches = [...playerMatches].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const last5 = sortedMatches.slice(0, 5);
  let formPoints = 0;
  for (const m of last5) {
    if (m.result === 'WIN') formPoints += 3;
    else if (m.result === 'DRAW') formPoints += 1;
    else formPoints -= 1;
  }
  const maxFormPoints = Math.max(1, last5.length * 3);
  const formRatio = Math.max(0, formPoints / maxFormPoints);
  const recentFormModifier = Math.round((formRatio * config.formWeight) * 10) / 10;

  // Sum total calculated rating
  const rawSum = 
    basePerformance + 
    winContribution + 
    goalContribution + 
    assistContribution + 
    defensiveContribution + 
    motmBonus + 
    opponentModifier + 
    tournamentBonus + 
    recentFormModifier;

  // Clamp rating within realistic eFootball OVR competitive range (65 - 99)
  const totalCalculatedRating = Math.round(Math.max(65, Math.min(99, rawSum)));

  const breakdown: RatingBreakdown = {
    basePerformance,
    winContribution,
    goalContribution,
    assistContribution,
    defensiveContribution,
    motmBonus,
    opponentModifier,
    tournamentBonus,
    recentFormModifier,
    totalCalculatedRating,
  };

  return { rating: totalCalculatedRating, breakdown };
}

/**
 * Recalculates all player aggregated stats, ratings, rankings, and movements.
 * Enforces the Single Source-Of-Truth principle:
 * MATCH DATA -> PLAYER PERFORMANCE -> AGGREGATED STATS -> RATING ENGINE -> RANKING ENGINE
 */
export function recalculateAllStatsAndRankings(
  players: Player[],
  matches: Match[],
  config: RatingConfig,
  actor: string = 'SYSTEM_AUTOMATION',
  reason: string = 'Recalculation executed'
): { updatedPlayers: Player[]; auditLog: AuditLog; rankings: PlayerRanking[] } {
  const updatedPlayers: Player[] = players.map(player => {
    // Collect all matches involving this player
    const playerMatches = matches.filter(m => 
      m.playerStats.some(ps => ps.playerId === player.id)
    );

    let wins = 0;
    let draws = 0;
    let losses = 0;
    let totalGoals = 0;
    let totalAssists = 0;
    let cleanSheets = 0;
    let motmCount = 0;

    for (const match of playerMatches) {
      if (match.result === 'WIN') wins++;
      else if (match.result === 'DRAW') draws++;
      else if (match.result === 'LOSS') losses++;

      const stat = match.playerStats.find(ps => ps.playerId === player.id);
      if (stat) {
        totalGoals += stat.goals;
        totalAssists += stat.assists;
        if (stat.cleanSheet) cleanSheets++;
        if (stat.motm) motmCount++;
      }
    }

    const totalMatches = playerMatches.length;
    const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 1000) / 10 : 0;

    // Calculate form (last 5 matches)
    const sorted = [...playerMatches].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const form: Array<'W' | 'D' | 'L'> = sorted.slice(0, 5).map(m => 
      m.result === 'WIN' ? 'W' : m.result === 'DRAW' ? 'D' : 'L'
    );

    // Calculate new rating & breakdown
    const { rating } = calculatePlayerRating(player, matches, config);

    // Maintain rating progression history
    const lastRatingProg = player.ratingProgression || [];
    const ratingProgression = [...lastRatingProg];
    const todayStr = new Date().toISOString().split('T')[0];
    if (ratingProgression.length === 0 || ratingProgression[ratingProgression.length - 1].rating !== rating) {
      ratingProgression.push({
        date: todayStr,
        rating,
        matchId: playerMatches[0]?.id || 'manual-recalc',
      });
    }

    return {
      ...player,
      rating,
      totalMatches,
      wins,
      draws,
      losses,
      winRate,
      goals: totalGoals,
      assists: totalAssists,
      cleanSheets,
      motmCount,
      form,
      ratingProgression,
    };
  });

  // Calculate Overall Rankings based on rating (tie-breaker: win rate, then goals)
  const sortedForRanking = [...updatedPlayers].sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    if (b.winRate !== a.winRate) return b.winRate - a.winRate;
    return b.goals - a.goals;
  });

  // Sort for Form Ranking (points in last 5 matches)
  const sortedForForm = [...updatedPlayers].sort((a, b) => {
    const scoreForm = (f: Array<'W' | 'D' | 'L'>) => 
      f.reduce((acc, curr) => acc + (curr === 'W' ? 3 : curr === 'D' ? 1 : 0), 0);
    return scoreForm(b.form) - scoreForm(a.form) || b.rating - a.rating;
  });

  const finalPlayers: Player[] = sortedForRanking.map((player, index) => {
    const newOverallRank = index + 1;
    const prevRank = player.overallRank || newOverallRank;
    
    let movement: RankMovement = 'SAME';
    let changeValue = 0;

    if (!player.overallRank) {
      movement = 'NEW';
      changeValue = 0;
    } else if (newOverallRank < prevRank) {
      movement = 'UP';
      changeValue = prevRank - newOverallRank;
    } else if (newOverallRank > prevRank) {
      movement = 'DOWN';
      changeValue = newOverallRank - prevRank;
    }

    const formRankIndex = sortedForForm.findIndex(p => p.id === player.id);

    return {
      ...player,
      overallRank: newOverallRank,
      weeklyRank: newOverallRank,
      monthlyRank: newOverallRank,
      seasonRank: newOverallRank,
      formRank: formRankIndex !== -1 ? formRankIndex + 1 : newOverallRank,
      rankMovement: movement,
      rankChangeValue: changeValue,
    };
  });

  // Build ranking list
  const rankings: PlayerRanking[] = finalPlayers.map(p => ({
    rank: p.overallRank,
    previousRank: (p.rankMovement === 'UP' ? p.overallRank + p.rankChangeValue : p.rankMovement === 'DOWN' ? p.overallRank - p.rankChangeValue : p.overallRank),
    movement: p.rankMovement,
    changeValue: p.rankChangeValue,
    playerId: p.id,
    player: p,
    rating: p.rating,
    matches: p.totalMatches,
    wins: p.wins,
    goals: p.goals,
    assists: p.assists,
    cleanSheets: p.cleanSheets,
    motmCount: p.motmCount,
    winRate: p.winRate,
    form: p.form,
  }));

  const auditLog: AuditLog = {
    id: `log-recalc-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor,
    action: 'RECALCULATE_RATINGS_AND_RANKINGS',
    entityType: 'RANKINGS',
    entityId: 'all-players',
    reason,
  };

  return { updatedPlayers: finalPlayers, auditLog, rankings };
}
