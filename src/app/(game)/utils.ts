import { formatUnits } from "viem";
type PrizeArrays = [bigint[], bigint[], boolean[], string[], bigint[]];

function extractRoundsPrizes(prizes: PrizeArrays) {
  if (!prizes) {
    return { currentRoundPrize: {}, lastRoundsPrizes: [] };
  }

  const numberOfRecords = 10;
  const [daiAmounts, darkAmounts, isCompleted, _winners, winningTickets] =
    prizes;

  const currentIndex = isCompleted.lastIndexOf(false);

  const currentRoundPrize = {
    roundId: currentIndex + 1,
    daiAmount: formatUnits(daiAmounts[currentIndex],18),
    darkAmount: formatUnits(darkAmounts[currentIndex], 18),
  };

  const lastRoundsPrizes = [];
  for (let i = currentIndex - 1; i >= 0 && lastRoundsPrizes.length < numberOfRecords; i--) {
    if (isCompleted[i]) {
      lastRoundsPrizes.push({
        roundId: i + 1,
        daiAmount: formatUnits(daiAmounts[i],18),
        darkAmount: formatUnits(darkAmounts[i],18),
        _winner: _winners[i],
        winningTicket: Number(winningTickets[i]) + 1,
      });
    }
  }

  return { currentRoundPrize, lastRoundsPrizes };
}

export { extractRoundsPrizes };
