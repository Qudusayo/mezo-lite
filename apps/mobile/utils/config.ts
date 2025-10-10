import { createClient } from '@dynamic-labs/client';
import { ReactNativeExtension } from '@dynamic-labs/react-native-extension';
import { ViemExtension } from "@dynamic-labs/viem-extension";
import 'fast-text-encoding';

const environmentId = process.env.EXPO_PUBLIC_ENVIRONMENT_ID as string;

if (!environmentId) {
  throw new Error('EXPO_PUBLIC_ENVIRONMENT_ID is required');
}

const evmNetworks = [
  {
    blockExplorerUrls: ['https://explorer.test.mezo.org/'],
    chainId: 31611,
    chainName: 'Mezo Testnet',
    iconUrls: ['https://icons.llamao.fi/icons/chains/rsz_mezo.jpg'],
    name: 'Mezo',
    nativeCurrency: {
      decimals: 18,
      name: 'Bitcoin',
      symbol: 'BTC',
      iconUrl: 'https://icons.llamao.fi/icons/chains/rsz_mezo.jpg',
    },
    networkId: 31611,

    rpcUrls: ['https://mezo-testnet.drpc.org'],
    vanityName: 'Mezo Testnet',
  },
];

export const dynamicClient = createClient({
  environmentId,
  evmNetworks,
  // Optional:
  appLogoUrl: 'https://demo.dynamic.xyz/favicon-32x32.png',
  appName: 'Mezo Lite',
})
  .extend(ReactNativeExtension())
  // @ts-ignore
  .extend(ViemExtension());
