"use client";

import { ReactNode } from "react";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";
import { WagmiProvider, createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Type workaround: OnchainKit is typed for React 19, but we use React 18.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SafeMiniKitProvider = MiniKitProvider as React.ComponentType<any>;

// Minimal wagmi config — required by MiniKitProvider's internal AutoConnect.
// We're not making any on-chain calls, this is just to satisfy the provider tree.
const wagmiConfig = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
});

const queryClient = new QueryClient();

/**
 * Providers component — wraps the entire app with the required provider tree:
 * WagmiProvider → QueryClientProvider → MiniKitProvider
 */
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <SafeMiniKitProvider enabled>
          {children}
        </SafeMiniKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
