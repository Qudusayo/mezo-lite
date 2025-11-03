import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import WithArrowBack from 'layout/WithArrowBack';
import { router, useLocalSearchParams } from 'expo-router';
import { useReactiveClient } from '@dynamic-labs/react-hooks';
import { dynamicClient } from 'utils/config';
import { defineChain, encodeFunctionData, Abi, parseUnits } from 'viem';
import { ERC20_ABI } from 'utils/abi';
import { MUSD_ADDRESS } from 'utils/constants';
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
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const recipient = localSearchParams.recipient;
  const address = localSearchParams.address;
  const amount = localSearchParams.amount;

  console.log('recipient', recipient);
  console.log('address', address);
  console.log('amount', amount);

  const handleSend = async () => {
    try {
      const wallet = wallets.primary;
      if (!wallet || isLoading) {
        return;
      }

      setIsLoading(true);
      setLoadingMessage('Preparing transaction...');

      if (Platform.OS === 'ios') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }

      const primaryWallet = wallets.primary;
      if (!primaryWallet) {
        setIsLoading(false);
        return;
      }

      setLoadingMessage('Connecting to wallet...');

      const publicClient = viem.createPublicClient({
        chain: mezoTestnet,
      });

      const walletClient = await viem.createWalletClient({
        chain: mezoTestnet,
        wallet: primaryWallet,
      });

      if (!walletClient || !publicClient) {
        setIsLoading(false);
        return;
      }

      setLoadingMessage('Checking token balance...');

      // Check user's token balance
      const balance = (await readContract(publicClient, {
        address: MUSD_ADDRESS,
        abi: ERC20_ABI as Abi,
        functionName: 'balanceOf',
        args: [walletClient.account.address],
      })) as bigint;

      const transferAmount = parseUnits(amount.toString(), 18);

      if (balance < transferAmount) {
        setIsLoading(false);
        setLoadingMessage('');
        alert('Insufficient token balance');
        return;
      }

      setLoadingMessage('Sending money...');

      // Perform direct ERC20 transfer
      const transferReceipt = await writeContract(publicClient, walletClient, {
        account: walletClient.account,
        to: MUSD_ADDRESS,
        chain: mezoTestnet,
        data: encodeFunctionData({
          abi: ERC20_ABI as Abi,
          functionName: 'transfer',
          args: [address as `0x${string}`, transferAmount],
        }),
      });

      if (transferReceipt.status === 'success') {
        setLoadingMessage('Money sent successfully!');
        // Navigate back after successful transfer
        setTimeout(() => {
          router.replace('/');
        }, 1000);
      } else {
        setIsLoading(false);
        setLoadingMessage('');
      }
    } catch (error) {
      console.error('Transaction failed:', error);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  return (
    <WithArrowBack>
      <View className="flex-1 pt-4">
        {/* Amount Section */}
        <View>
          <View className="flex-row items-start gap-2">
            <View>
              <Text className="font-satoshiMedium text-xl">Recipient</Text>
              <Text className="font-satoshiSemiBold text-2xl text-black">{recipient}</Text>
            </View>
          </View>
        </View>

        <View className="flex-1 items-center justify-center">
          <Text className="smb-8 text-center font-satoshiSemiBold text-6xl text-black">
            ${amount}
          </Text>
          <Text className="smb-8 text-center font-satoshiSemiBold text-xl text-gray-400">
            {amount} MUSD
          </Text>
        </View>

        {/* Continue Button */}
        <View className="gap-6">
          <View className="flex-row items-center justify-between">
            <Text className="smb-8 text-center font-satoshiSemiBold text-xl text-black">
              Total Amount :
            </Text>
            <Text className="smb-8 text-center font-satoshiSemiBold text-xl text-gray-400">
              {amount} MUSD
            </Text>
          </View>
          <TouchableOpacity
            className={`items-center rounded-3xl py-4 ${isLoading ? 'bg-gray-400' : 'bg-primary'}`}
            onPress={handleSend}
            activeOpacity={0.8}
            disabled={isLoading}>
            {isLoading ? (
              <View className="flex-row items-center gap-3">
                <ActivityIndicator size="small" color="black" />
                <Text className="font-satoshiMedium text-lg text-black">{loadingMessage}</Text>
              </View>
            ) : (
              <Text className="font-satoshiMedium text-lg text-black">Send</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </WithArrowBack>
  );
}
