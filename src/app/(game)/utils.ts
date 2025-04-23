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
    daiAmount: formatUnits(daiAmounts[currentIndex], 18),
    darkAmount: formatUnits(darkAmounts[currentIndex], 18),
  };

  const lastRoundsPrizes = [];
  for (
    let i = currentIndex - 1;
    i >= 0 && lastRoundsPrizes.length < numberOfRecords;
    i--
  ) {
    if (isCompleted[i]) {
      lastRoundsPrizes.push({
        roundId: i + 1,
        daiAmount: formatUnits(daiAmounts[i], 18),
        darkAmount: formatUnits(darkAmounts[i], 18),
        _winner: _winners[i],
        winningTicket: Number(winningTickets[i]) + 1,
      });
    }
  }

  return { currentRoundPrize, lastRoundsPrizes };
}

const generateTicketMapping = (
  participants: [number[], string[]],
  userAddress: `0x${string}`,
) => {
  const participantsTickets = participants?.[0] ?? [];
  const participantsAddress = participants?.[1] ?? [];
  return participantsTickets.map((participant, index) => {
    return {
      ticketNumber: Number(participant) + 1,
      walletAddress: participantsAddress?.[index],
      isUserCell: participantsAddress?.[index] === userAddress,
      isBurst: false,
    };
  });
};

export { extractRoundsPrizes, generateTicketMapping };
