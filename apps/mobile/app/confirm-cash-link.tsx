import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import WithArrowBack from 'layout/WithArrowBack';
import { useLocalSearchParams } from 'expo-router';
import * as Crypto from 'expo-crypto';
import { UnlinkIcon } from 'components/icons';
import { useReactiveClient } from '@dynamic-labs/react-hooks';
import { dynamicClient } from 'utils/config';
import { parseAbi, defineChain, encodeFunctionData } from 'viem';
import { CASHLINK_ESCROW_ABI, ERC20_ABI } from 'utils/abi';
import {} from 'viem';

export const mezoTestnet = defineChain({
  id: 31611,
  name: 'Mezo Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Bitcoin',
    symbol: 'BTC',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.test.mezo.org'],
    },
  },
});

export default function ConfirmCashLink() {
  const localSearchParams = useLocalSearchParams();
  const { wallets, viem } = useReactiveClient(dynamicClient);

  const cashAmount = localSearchParams.amount;

  const handleSend = async () => {
    const wallet = wallets.primary;
    if (!wallet) {
      return;
    }

    if (Platform.OS === 'ios') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    // Generate a random claim code
    const randomBytes = Crypto.getRandomValues(new Uint8Array(16));
    const claimCode = Buffer.from(randomBytes).toString('hex');

    const contractAddress = '0xD60e914Ff6f3E86B3ACf060AF98152E38702fCcC';
    const walletClient = await viem.createWalletClient({ wallet, chain: mezoTestnet });

    console.log('WALLET CLIENT: ', walletClient);

    const data = encodeFunctionData({
      abi: parseAbi(JSON.parse(ERC20_ABI)),
      functionName: 'allowance',
      args: [contractAddress, wallet.address],
    });

    walletClient.sendTransaction({ to: contractAddress, data });

    const hash2 = await walletClient.writeContractSync({
      address: '0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503',
      abi: parseAbi(JSON.parse(ERC20_ABI)),
      functionName: 'allowance',
      args: [contractAddress, wallet.address],
    });

    console.log('USER ALLOWANCE: ', hash2);

    // const data = encodeFunctionData({
    //   abi: parseAbi(JSON.parse(CASHLINK_ESCROW_ABI)),
    //   functionName: 'createCashlink',
    //   args: [cashAmount, claimCode],
    // });

    // const hash = await walletClient.sendTransaction({ to: contractAddress, data });

    const hash = await walletClient.writeContractSync({
      address: contractAddress,
      abi: parseAbi(JSON.parse(CASHLINK_ESCROW_ABI)),
      functionName: 'createCashlink',
      args: [cashAmount, claimCode],
    });

    console.log('HASH: ', hash);
  };

  return (
    <WithArrowBack>
      <View className="flex-1 pt-4">
        {/* Amount Section */}
        <View>
          <View className="flex-row items-start gap-2">
            <View className="rounded-full bg-primary p-2">
              <UnlinkIcon color="black" width={24} height={24} />
            </View>
            <View>
              <Text className="font-satoshiSemiBold text-4xl">Send to</Text>
              <Text className="-top-2 font-satoshiMedium text-xl text-black">Cash Link</Text>
            </View>
          </View>
        </View>

        <View className="flex-1 items-center justify-center">
          <Text className="smb-8 text-center font-satoshiSemiBold text-6xl text-black">
            ${cashAmount}
          </Text>
          <Text className="smb-8 text-center font-satoshiSemiBold text-xl text-gray-400">
            {cashAmount} MUSD
          </Text>
        </View>

        {/* Continue Button */}
        <View className="gap-6">
          <View className="flex-row items-center justify-between">
            <Text className="smb-8 text-center font-satoshiSemiBold text-xl text-black">
              Total Amount :
            </Text>
            <Text className="smb-8 text-center font-satoshiSemiBold text-xl text-gray-400">
              {cashAmount} MUSD
            </Text>
          </View>
          <TouchableOpacity
            className="items-center rounded-3xl bg-primary py-4"
            onPress={handleSend}
            activeOpacity={0.8}>
            <Text className="font-satoshiMedium text-lg text-black">Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </WithArrowBack>
  );
}
