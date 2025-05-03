import {
  base,
  baseSepolia,
  pulsechain,
  pulsechainV4,
  sepolia,
} from "viem/chains";
type Address = `0x${string}`;
export const CONTRACTS: Record<
  number,
  {
    wishWell: Address;
    miningRig: Address;
    darkX: Address;
    darkClaims?: Address;
    dark?: Address;
    launchControlCenter?: Address;
    fuelCell?: Address;
    journeyPhaseManager?: Address;
    darkFaucet?: Address;
    treasury?: Address;
    jackpot?: Address;
    evilAddress?: Address;
    pinkMistWell?: Address;
  }
> = {
  [sepolia.id]: {
    miningRig: "0x020d3Ca9605bb17CC17Ea0DB2bFfed3fA0869fCF",
    darkX: "0xb1BF01E195D511509B12D980769351eF5255eE0f",
    darkClaims: "0x6b3099EfFF4dAE69e48240d88C141a7cfa793ae6",
    dark: "0x20E070c2e6eB00bC0ACFD801778a1BE24D5423c1",
    wishWell: "0x43F4cdC343f39EDD323C66492E9fdf3D72Df0eC0",
    fuelCell: "0x77fB461abB743497dc23EB1e2a4fdEfAc35aFfea",
    launchControlCenter: "0x09d12a40EbeA8F7860a32973D514E6b55d279a2c",
    journeyPhaseManager: "0xA2893EBA6461c7e9142Bd5781E53782927894d61",
    evilAddress: "0x86E29Dbd64F36a66d0Ddb96E2FF2A9d571fb41dB",
    treasury: "0xB52C954442f021D85Bd36103e742A07825a1af72",
    jackpot: "0x3446Fd1cAd7ABA32b998B757767Be19569f866d6",
    darkFaucet: "0x1792dedc1A50849041C063BFB686b8350DF9CD73",
  },
  [pulsechainV4.id]: {
    wishWell: "0x43F4cdC343f39EDD323C66492E9fdf3D72Df0eC0",
    miningRig: "0x020d3Ca9605bb17CC17Ea0DB2bFfed3fA0869fCF",
    darkX: "0xb1BF01E195D511509B12D980769351eF5255eE0f",
    dark: "0x6079e3031bD896A4726166c0c141B4a82f87Fee3",
    darkClaims: "0xc83e188ec2DD08EC60a6584F0d4DCE5B384f4632",
    fuelCell: "0x7A17dAa217894B9840746a2e03Cb155d6dc56ada",
    launchControlCenter: "0x068C4701aDFaeE7078419A1784dbE1313c87F6F3",
    journeyPhaseManager: "0xf9290dad6aB7B9F1ECDA1aB3CCBe42c69E93AAeA",
    evilAddress: "0xf16834786221C51678cB386cf77a57ac7fcb3441",
    treasury: "0x1A530A9803B8faFA34491D70Fa7EE49C220e29Dc",
    jackpot: "0xf883c46b6Ac7d7b8936122F88b75070Ad6f2f47B",
    pinkMistWell: "0x35BAFE8D9f92BbA6a6fbBDC85d9fd4bF74E6852e",
  },
  [baseSepolia.id]: {
    miningRig: "0x8Dea737AE483153c69934ff8a5c7E3D448c2DB4C",
    darkX: "0xdE87E198D2A5d6894a03AfCb34876601A6dd226f",
    dark: "0x22e896BE411C1FC4a18945880585172cE2C7Efc9",
    wishWell: "0xC8A96A9163C2D11e2002C589a5DC7Ee4267499e2",
    fuelCell: "0xff2ad9E8A6F86b1EFD250Ccb60E098EF49D87c55",
    launchControlCenter: "0x3597936252158be0cb3720a6e18B4c7006c350a6",
    journeyPhaseManager: "0x852eC407240B3D3059AD58D8CF5897332A2ce907",
    evilAddress: "0x02a5C61F0E78D8B1eBdca7346654D3d2fFDA5588",
    treasury: "0x5C0CB2f806Bfe9827709853BE7d950921Fac420E",
    jackpot: "0x557913C038C51a8f976a4De8032Bea92e8DeB4F3",
    darkFaucet: "0xde199d27867f42b0F96614FcFe107Fabae19091c",
  },
  [pulsechain.id]: {
    miningRig: "0x1Eca1A64E18E72c46971a80D91F015a569FE9FBd",
    darkX: "0xCC18F40724971Be55AB5508607d8024Ee9Bf8796",
    wishWell: "0x332211A407489F497cD58bac7Db3F10Da5da47Ff",
    darkClaims: "0xcae03380b98B479221FDc03E1c4fAA94137BDE6b",
    dark: "0x1578F4De7fCb3Ac9e8925ac690228EDcA3BBc7c5",
    fuelCell: "0x2187816076a1a129d03b4c14c88983AAf54052e3",
    launchControlCenter: "0xCb1B7DFd31628E00b26b77f453f76280BFBBb809",
    journeyPhaseManager: "0xb2561655DAF1DE668F0240aCC6Cb9fb6f2b0450E",
    evilAddress: "0x3dcbDaef2D25Baeb1a39843340D88cb7124FB6D3",
    treasury: "0x9007485D1791793c857E1dCAF405e3cf2477Ef84",
    jackpot: "0x1b8E4f5300706651c3E6fE166487cCa03dE690B6",
    pinkMistWell: "0xfFB03c9fDACCF13eA2D6E2dfcA8dC562861FD065",
  },
  [base.id]: {
    miningRig: "0x698Ae58B7AB13ad232A84d684e8111D2c6A6d904",
    darkX: "0xb070db7dCad8F5081c3e9033633782258fCa811c",
    wishWell: "0x332211A407489F497cD58bac7Db3F10Da5da47Ff",
  },
};
