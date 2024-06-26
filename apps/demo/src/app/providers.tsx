"use client";

import {
  ApiProvider,
  Web3Provider,
  grantsStackAPI,
} from "../../../../packages/kit/src";

export function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Web3Provider>
      <ApiProvider provider={grantsStackAPI}>{children}</ApiProvider>
    </Web3Provider>
  );
}
