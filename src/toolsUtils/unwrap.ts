import { API_ENDPOINT, SUBGRAPH } from "@/constants";
import axios from "axios";
import { getAddress } from "viem";

const fetchYieldAmountPerFuelCellMapping = async () => {
  const yieldQuery = `
        query MyQuery {
            yieldPayouts(limit: 900) {
                items {
                    journeyId
                    amountPerFuelCell
                }
            }
        }
    `;

  let response: {
    data?: {
      data: {
        yieldPayouts: {
          items: { journeyId: string; amountPerFuelCell: string }[];
        };
      };
    };
  } = {};

  try {
    response = await axios.post(
      SUBGRAPH,
      {
        query: yieldQuery,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (e) {
    console.error("Error while fetching yield amount per fuel cell: ", e);
  }

  const yieldPayouts = response?.data?.data?.yieldPayouts?.items || [];

  const yieldPayoutMapping = yieldPayouts.reduce(
    (acc: Record<string, number>, yieldPayout) => {
      if (!acc[yieldPayout.journeyId]) {
        acc[yieldPayout.journeyId] = 0;
      }
      acc[yieldPayout.journeyId] += Number(yieldPayout.amountPerFuelCell);
      return acc;
    },
    {},
  );

  return yieldPayoutMapping;
};

const userOwnedFuelCellsQuery = (
  walletAddress: string,
  batchSize: number = 500,
  afterCursor?: string,
) => `query MyQuery {
    users(where: { address: "${walletAddress}" }) {
      items {
        ownedFuelCells(after: ${
          afterCursor ? `"${afterCursor}"` : null
        }, limit: ${batchSize}) {
          items {
            journeyId
            tokenId
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  }`;

const fetchUserOwnedFuelCellsPaginated = async (
  walletAddress: string,
  batchSize: number,
  cursor?: string,
) => {
  let userOwnedFuelCells: { journeyId: number; tokenId: number }[] = [];
  let pageInfo: { endCursor: string; hasNextPage: boolean } = {
    endCursor: "",
    hasNextPage: true,
  };

  const checksumWalletAddress = getAddress(walletAddress);

  try {
    const response = await axios.post(
      SUBGRAPH,
      {
        query: userOwnedFuelCellsQuery(
          checksumWalletAddress,
          batchSize,
          cursor,
        ),
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const currentFuelCells: { journeyId: string; tokenId: string }[] =
      response?.data?.data?.users?.items?.[0]?.ownedFuelCells?.items || [];
    pageInfo =
      response?.data?.data?.users?.items?.[0]?.ownedFuelCells?.pageInfo || {};

    userOwnedFuelCells = currentFuelCells.map((fuelCell) => {
      return {
        journeyId: parseInt(fuelCell.journeyId, 10),
        tokenId: parseInt(fuelCell.tokenId, 10),
      };
    });
  } catch (e) {
    console.error("Error while fetching mints from subgraph: ", e);
  }

  return { userOwnedFuelCells, pageInfo };
};

// const fetchUserOwnedFuelCells = async (walletAddress: string) => {
//   let userOwnedFuelCells = [];
//   let hasNextPage = true;
//   let endCursor = null;

//   const checksumWalletAddress = getAddress(walletAddress);

//   try {
//     while (hasNextPage) {
//       const response = await axios.post(
//         secrets?.ERA_3_SUBGRAPH_URL,
//         {
//           query: userOwnedFuelCellsQuery(checksumWalletAddress, endCursor, 900),
//         },
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         },
//       );

//       const currentFuelCells =
//         response?.data?.data?.users?.items?.[0]?.ownedFuelCells?.items || [];
//       const pageInfo =
//         response?.data?.data?.users?.items?.[0]?.ownedFuelCells?.pageInfo || {};

//       userOwnedFuelCells = userOwnedFuelCells.concat(
//         currentFuelCells.map((fuelCell) => {
//           return {
//             journeyId: parseInt(fuelCell.journeyId, 10),
//             tokenId: parseInt(fuelCell.tokenId, 10),
//           };
//         }),
//       );

//       hasNextPage = pageInfo.hasNextPage;
//       endCursor = pageInfo.endCursor;
//     }
//   } catch (e) {
//     console.error(
//       "Cron Service: Error while fetching mints from subgraph: ",
//       e,
//     );
//   }

//   return userOwnedFuelCells;
// };

// const fetchTotalUserYield = async (walletAddress: string) => {
//   const [yieldMapping, userOwnedFuelCells] = await Promise.all([
//     fetchYieldAmountPerFuelCellMapping(),
//     fetchUserOwnedFuelCells(walletAddress),
//   ]);

//   const userFuelCellsMapping = userOwnedFuelCells.reduce((acc, fuelCell) => {
//     const journeyId = fuelCell.journeyId;

//     if (!acc[journeyId]) {
//       acc[journeyId] = 0;
//     }

//     acc[journeyId] += 1;
//     return acc;
//   }, {});

//   let totalFuelCells = 0;
//   let totalYield = 0;

//   for (const journeyId in userFuelCellsMapping) {
//     const fuelCellsAmount = userFuelCellsMapping[journeyId];
//     const yieldValue = yieldMapping[journeyId] || 0;

//     totalFuelCells += fuelCellsAmount;
//     totalYield += fuelCellsAmount * yieldValue;
//   }

//   return { totalFuelCells: totalFuelCells, totalYield: totalYield };
// };

const fetchUserFuelCellsMappingWithTotalYield = async (
  walletAddress: string,
  batchSize: number,
  cursor?: string,
) => {
  const [yieldMapping, fuelCellsResponse] = await Promise.all([
    fetchYieldAmountPerFuelCellMapping(),
    fetchUserOwnedFuelCellsPaginated(walletAddress, batchSize, cursor),
  ]);

  const { userOwnedFuelCells, pageInfo } = fuelCellsResponse;

  const userFuelCellsMapping = userOwnedFuelCells.reduce(
    (
      acc: Record<
        string,
        { fuelCells: number[]; totalYieldPerFuelCell: number }
      >,
      fuelCell,
    ) => {
      const { tokenId, journeyId } = fuelCell;

      if (!acc[journeyId]) {
        acc[journeyId] = {
          fuelCells: [],
          totalYieldPerFuelCell: yieldMapping[journeyId] || 0,
        };
      }
      acc[journeyId].fuelCells.push(tokenId);

      return acc;
    },
    {},
  );

  console.log({ userOwnedFuelCells, pageInfo, userFuelCellsMapping });
  return { ...userFuelCellsMapping, pageInfo };
};

const fetchNonPrunedWinnings = async (userAddress: string) => {
  if (userAddress) {
    try {
      const response = await axios.get(
        `${API_ENDPOINT}/api/lottery-result?walletAddress=${userAddress}`,
      );

      const lotteryResult = response?.data?.lotteryResult ?? [];
      const nonPrunedWinnings: Record<number, number[]> = {};
      lotteryResult.forEach(
        (result: { lotteryId: number; journeyId: number; tokenId: number }) => {
          const { tokenId, journeyId } = result;
          const oldEntry = nonPrunedWinnings[journeyId] ?? [];
          nonPrunedWinnings[journeyId] = [...oldEntry, tokenId];
        },
      );

      return nonPrunedWinnings;
    } catch (err) {
      console.log("Error while fetching user winnings!", err);
      return {};
    }
  }

  return {};
};

export { fetchUserFuelCellsMappingWithTotalYield, fetchNonPrunedWinnings };
