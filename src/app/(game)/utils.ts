type PrizeArrays = [number[], number[], boolean[], string[], number[]];

function extractRoundsPrizes(prizes: PrizeArrays) {
  if (!prizes) {
    return { currentRoundPrize: {}, lastRoundsPrizes: [] };
  }

  const [daiAmounts, darkAmounts, isCompleted, _winners, winningTickets] =
    prizes;

  const currentIndex = isCompleted.lastIndexOf(false);

  const currentRoundPrize = {
    roundId: currentIndex + 1,
    daiAmount: daiAmounts[currentIndex],
    darkAmount: darkAmounts[currentIndex],
  };

  const lastRoundsPrizes = [];
  for (let i = currentIndex - 1; i >= 0 && lastRoundsPrizes.length < 5; i--) {
    if (isCompleted[i]) {
      lastRoundsPrizes.push({
        roundId: i + 1,
        daiAmount: daiAmounts[i],
        darkAmount: darkAmounts[i],
        _winner: _winners[i],
        winningTicket: winningTickets[i],
      });
    }
  }

  return { currentRoundPrize, lastRoundsPrizes };
}

export { extractRoundsPrizes };
