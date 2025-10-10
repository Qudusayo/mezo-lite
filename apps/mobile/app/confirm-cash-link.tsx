import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import WithArrowBack from 'layout/WithArrowBack';
import { router, useLocalSearchParams } from 'expo-router';
import * as Crypto from 'expo-crypto';
import { UnlinkIcon } from 'components/icons';
import { useReactiveClient } from '@dynamic-labs/react-hooks';
import { dynamicClient } from 'utils/config';
import { defineChain, encodeFunctionData, Abi, maxUint256, parseUnits } from 'viem';
import { CASHLINK_ESCROW_ABI, ERC20_ABI } from 'utils/abi';
import { ethers, toUtf8Bytes, keccak256 } from 'ethers';
import { CASHLINK_ESCROW_ADDRESS, MUSD_ADDRESS } from 'utils/constants';
import { readContract, writeContract } from 'utils/contract-call';

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
      webSocket: ['wss://mezo-testnet.drpc.org'],
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

    const primaryWallet = wallets.primary;
    if (!primaryWallet) return;

    const publicClient = viem.createPublicClient({
      chain: mezoTestnet,
    });

    const walletClient = await viem.createWalletClient({
      chain: mezoTestnet,
      wallet: primaryWallet,
    });

    if (!walletClient || !publicClient) return;

    const allowance = (await readContract(publicClient, {
      address: MUSD_ADDRESS,
      abi: ERC20_ABI as Abi,
      functionName: 'allowance',
      args: [walletClient.account.address, CASHLINK_ESCROW_ADDRESS],
    })) as bigint;

    if (allowance < BigInt(parseUnits(cashAmount.toString(), 18))) {
      // Approve unlimited allowance
      await writeContract(publicClient, walletClient, {
        account: walletClient.account,
        to: MUSD_ADDRESS,
        chain: mezoTestnet,
        data: encodeFunctionData({
          abi: ERC20_ABI as Abi,
          functionName: 'approve',
          args: [CASHLINK_ESCROW_ADDRESS, maxUint256],
        }),
      });
    }

    // Generate a random claim code
    const randomBytes = Crypto.getRandomValues(new Uint8Array(16));
    const claimCode = Buffer.from(randomBytes).toString('hex');
    const claimHash = keccak256(toUtf8Bytes(claimCode));

    console.log(
      `==========================================
CLAIM CODE: ${claimCode}
CLAIM HASH: ${claimHash}
==========================================`
    );

    const createCashlinkReceipt = await writeContract(publicClient, walletClient, {
      account: walletClient.account,
      to: CASHLINK_ESCROW_ADDRESS,
      chain: mezoTestnet,
      data: encodeFunctionData({
        abi: CASHLINK_ESCROW_ABI,
        functionName: 'createCashlink',
        args: [BigInt(ethers.parseEther(cashAmount.toString())), claimHash as `0x${string}`],
      }),
    });

    if (createCashlinkReceipt.status === 'success') {
      return router.replace('/');
    }
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
