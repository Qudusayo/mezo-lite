import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import WithArrowBack from 'layout/WithArrowBack';
import { useReactiveClient } from '@dynamic-labs/react-hooks';
import { dynamicClient } from 'utils/config';
import { mezoTestnet } from 'app/confirm-cash-link';
import { writeContract } from 'utils/contract-call';
import { CASHLINK_ESCROW_ADDRESS } from 'utils/constants';
import { CASHLINK_ESCROW_ABI } from 'utils/abi';
import { encodeFunctionData } from 'viem';
import { cn } from 'utils';

const ClaimCashLink = () => {
  const [claimCode, setClaimCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { wallets, viem } = useReactiveClient(dynamicClient);

  const handleClaimCashLink = async () => {
    if (!claimCode.trim()) {
      Alert.alert('Error', 'Please enter a cash link code');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Claiming Cash Link ...');

      const wallet = wallets.primary;
      if (!wallet) {
        Alert.alert('Error', 'No wallet connected');
        return;
      }

      const primaryWallet = wallets.primary;
      if (!primaryWallet) {
        Alert.alert('Error', 'No primary wallet found');
        return;
      }

      const publicClient = viem.createPublicClient({
        chain: mezoTestnet
      });

      const walletClient = await viem.createWalletClient({
        chain: mezoTestnet,
        wallet: primaryWallet
      });

      if (!walletClient || !publicClient) {
        Alert.alert('Error', 'Failed to create wallet client');
        return;
      }

      const claimCashlinkReceipt = await writeContract(publicClient, walletClient, {
        account: walletClient.account,
        to: CASHLINK_ESCROW_ADDRESS,
        chain: mezoTestnet,
        data: encodeFunctionData({
          abi: CASHLINK_ESCROW_ABI,
          functionName: 'claim',
          args: [claimCode.trim()]
        })
      });

      console.log('Claim Cash Link Receipt', claimCashlinkReceipt);
      Alert.alert('Success', 'Cash link claimed successfully!');
      setClaimCode('');
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to claim cash link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WithArrowBack>
      <View className="flex-1 gap-16 bg-white pt-4">
        <View className="flex-1">
          <View className="mb-8">
            <Text className="mb-2 font-satoshiSemiBold text-4xl">Redeem a Cash Link</Text>
            <Text className="font-satoshiRegular text-base text-gray-500">
              Enter the cash link code to claim your funds
            </Text>
          </View>

          <View className="mb-6">
            <TextInput
              value={claimCode}
              onChangeText={setClaimCode}
              placeholder="Enter cash link code"
              className="font-satoshiRegular rounded-lg border border-gray-300 p-4 text-lg leading-tight text-black"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            className={cn(
              'mt-auto flex-row items-center justify-center gap-2 rounded-3xl p-4',
              isLoading || !claimCode.trim() ? 'bg-gray-300' : 'bg-primary'
            )}
            onPress={handleClaimCashLink}
            activeOpacity={0.8}
            disabled={isLoading || !claimCode.trim()}
          >
            <Text
              className={cn(
                'font-satoshiSemiBold text-lg',
                isLoading || !claimCode.trim() ? 'text-gray-500' : 'text-white'
              )}
            >
              {isLoading ? 'Claiming...' : 'Claim Cash Link'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </WithArrowBack>
  );
};

export default ClaimCashLink;
