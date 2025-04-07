import { toBoolean } from "./utils";

export const TEST_NETWORK = toBoolean(process.env.NEXT_PUBLIC_TEST);
export const PROJECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PID;

export const PROXY_API_ENDPOINT = "/api/";

export const API_ENDPOINT = TEST_NETWORK
  ? process.env.NEXT_PUBLIC_TEST_BACKEND
  : process.env.NEXT_PUBLIC_BACKEND;

export const SUBGRAPH = `${process.env.NEXT_PUBLIC_ERA3_SUBGRAPH}`;

export const TIMER = process.env.NEXT_PUBLIC_TIMER;

export const TELEGRAM = "https://t.me/antigravitysaga";

export const TWITTER = "https://twitter.com/HexrayVision";

export const TWITTER_HEXIEST = "https://twitter.com/TheHEXiestMan";

export const EMAIL_CODY = "codyasmith@live.com";

export const lotteryBuffer = Number(
  process.env.NEXT_PUBLIC_LOTTERY_BUFFER ?? "0",
);

export const TIKTOK_CODY = "https://tiktok.com/@c.asmith";

export const INSTAGRAM_CODY = "https://www.instagram.com/c.asmith87/";

export const YOUTUBE =
  "https://www.youtube.com/channel/UCfySj3nKqjM44iD58oB8Hyw";

export const HOW_TO = process.env.NEXT_PUBLIC_HOW_TO_URL;

export const POLL_TIME = parseInt(`${process.env.NEXT_PUBLIC_POLL_TIME}`);

export const IMAGEKIT = "https://ik.imagekit.io/agogmax/Antigravity";

export const BUY_DARK_URL = `${process.env.NEXT_PUBLIC_BUY_DARK_URL}`;
