import { request } from "graphql-request";
import { base, baseSepolia, pulsechain, pulsechainV4 } from "viem/chains";

const endpoint: Record<number, string> = {
  [pulsechainV4.id]: `${process.env.NEXT_PUBLIC_PULSE_SUBGRAPH}`,
  [baseSepolia.id]: `${process.env.NEXT_PUBLIC_BASE_SUBGRAPH}`,
  [pulsechain.id]: `${process.env.NEXT_PUBLIC_PULSE_SUBGRAPH}`,
  [base.id]: `${process.env.NEXT_PUBLIC_BASE_SUBGRAPH}`,
};

export const gqlFetcher = async <T>(
  query: string,
  variables: Record<string, any>,
  chainId: number,
  url?: string,
): Promise<T> => {
  //   const document = gql(query);
  const data = await request<T>(url ?? endpoint[chainId], query, variables);
  return data;
};

export const gqlMutate = async <T>(
  query: string,
  variables: Record<string, any>,
  chainId: number,
): Promise<T> => {
  //   const document = gql(query);
  const data = await request<T>(endpoint[chainId], query, variables);
  return data;
};
