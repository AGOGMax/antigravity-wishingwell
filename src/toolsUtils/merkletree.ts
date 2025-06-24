import { encodePacked, keccak256 } from "viem";
import { MerkleTree } from "merkletreejs";

export const createMerkleTreeForLottery = (
  data: { tokenId: number; lotteryId: number; journeyId: number }[],
) => {
  data.sort((a, b) => a.tokenId - b.tokenId);

  const leaves = data.map((entry) =>
    keccak256(
      encodePacked(
        ["uint256", "uint16", "uint16"],
        [BigInt(entry.tokenId), entry.journeyId, entry.lotteryId],
      ),
    ),
  );

  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  return tree;
};
