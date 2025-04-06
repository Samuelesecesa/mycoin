import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

interface CoinValueTier {
  fino_a: number;
  valore: number;
}

export interface CoinValueData {
  name: string;
  totalUsers: number;
  currentValue: number;
  nextTier: {
    users: number;
    value: number;
    percentage: number;
  } | null;
  allTiers: CoinValueTier[];
}

export function useCoinValue() {
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery<CoinValueData>({
    queryKey: ['/api/coin/value'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    // Opzioni per aggiornare il valore ogni 60 secondi
    refetchInterval: 60 * 1000,
    staleTime: 30 * 1000,
  });

  return {
    coinValue: data,
    isLoading,
    error,
    refetch
  };
}