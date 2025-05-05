"use client";

import { OnchainKitProvider } from "@coinbase/onchainkit";
import { http, createConfig, WagmiProvider, useAccount } from "wagmi";
import type { ReactNode } from "react";
import "@rainbow-me/rainbowkit/styles.css";
import {
  connectorsForWallets,
  darkTheme,
  DisclaimerComponent,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { baseSepolia } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

import {
  coinbaseWallet,
  metaMaskWallet,
  rainbowWallet,
  trustWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";


const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string;
const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [
        coinbaseWallet,
        metaMaskWallet,
        trustWallet,
        rainbowWallet,
        () =>
          walletConnectWallet({
            projectId:projectId,
          }),
      ],
    },
  ],
  {
    appName: "Payne",
    projectId: projectId,
  }
);

// Create wagmi config for Base Sepolia
const config = createConfig({
  chains: [baseSepolia],
  connectors,
  transports: {
    [baseSepolia.id]: http("https://sepolia.base.org"), // ✅ Base Sepolia RPC
  },
});

export function Providers(props: { children: ReactNode }) {
  const queryClient = new QueryClient();
  return (
    <WagmiProvider config={config}>
      <OnchainKitProvider
        apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
        chain={baseSepolia}
        config={{
          appearance: {
            mode: "auto",
          },
          paymaster: process.env.PAYMASTER_ENDPOINT,
        }}
      >
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            // modalSize="compact"
            theme={darkTheme({
              accentColor: "#7b3fe4",
              accentColorForeground: "white",
              borderRadius: "small",
              fontStack: "system",
              overlayBlur: "small",
            })}
            appInfo={{
              appName: "Rainbowkit Demo",
              disclaimer:Disclaimer,
              learnMoreUrl: "https://learnaboutcryptowallets.example",
            }}
            
          >
            {props.children}
          </RainbowKitProvider>
        </QueryClientProvider>
      </OnchainKitProvider>
    </WagmiProvider>
  );
}

const Disclaimer: DisclaimerComponent = ({ Text, Link }) => (
  <Text>
    By connecting your wallet, you agree to the{" "}
    <Link href="https://termsofservice.xyz">Terms of Service</Link> and
    acknowledge you have read and understand the protocol{" "}
    <Link href="https://disclaimer.xyz">Disclaimer</Link>
  </Text>
);
