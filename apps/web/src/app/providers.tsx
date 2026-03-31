import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSessionStore } from "../stores";

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
        refetchOnWindowFocus: false
      }
    }
  });
}

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <SessionBootstrap />
      {children}
    </QueryClientProvider>
  );
}

function SessionBootstrap() {
  const ensureGuestSession = useSessionStore((state) => state.ensureGuestSession);

  useEffect(() => {
    ensureGuestSession();
  }, [ensureGuestSession]);

  return null;
}