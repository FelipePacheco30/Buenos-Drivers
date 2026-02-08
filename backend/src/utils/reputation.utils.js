/**
 * Calcula média de avaliações
 */
export function calculateAverageRating(ratings = []) {
  if (!ratings.length) return 0;

  const total = ratings.reduce((sum, rating) => sum + Number(rating), 0);
  return Number((total / ratings.length).toFixed(2));
}

/**
 * Atualiza reputação com nova avaliação
 */
export function updateReputation(currentRating, totalRatings, newRating) {
  const totalScore = currentRating * totalRatings + newRating;
  const newTotalRatings = totalRatings + 1;

  return {
    rating: Number((totalScore / newTotalRatings).toFixed(2)),
    totalRatings: newTotalRatings
  };
}

/**
 * Classificação textual da reputação
 */
export function reputationLevel(rating) {
  if (rating >= 4.8) return "EXCELENTE";
  if (rating >= 4.5) return "ÓTIMO";
  if (rating >= 4.0) return "BOM";
  if (rating >= 3.0) return "REGULAR";
  return "RUIM";
}
