import { fetcher, mutate } from "@/api/restClient";
import {
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export const useRestFetch = <T>(
  tags: string[],
  endpoint: string,
  {
    proxy = false,
    select,
    enabled = true,
  }: {
    proxy?: boolean;
    select?: (arg0: any) => any;
    enabled?: boolean;
  },
): UseQueryResult<T, Error> => {
  const result = useQuery<T, Error>({
    queryKey: [...tags],
    queryFn: () => fetcher<T>(endpoint, proxy),
    enabled: enabled,
  });
  return result;
};

export const useRestPost = <T>(
  tags: string[],
  url: string,
): UseMutationResult<T, any, Record<string, any>, unknown> => {
  const queryClient = useQueryClient();
  const result = useMutation<T, any, Record<string, any>>({
    mutationKey: tags,
    mutationFn: (payload: Record<string, any>) => mutate<T>(url, payload),
    onError: (error: any) => {
      console.error(error);
      // errorToast(`Error: ${error.message}. Try again please.`);

      // TODO: Add Sentry logs here as well
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tags });
    },
  });
  return result;
};
