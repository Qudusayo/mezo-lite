import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, Linking, Alert, ActivityIndicator, Platform } from 'react-native';
import { useBottomSheetContext } from 'context/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cn } from 'utils';
import { useReactiveClient } from '@dynamic-labs/react-hooks';
import { dynamicClient } from 'utils/config';
import { mezoTestnet } from 'app/confirm-cash-link';
import { encodeFunctionData, Abi, getAddress } from 'viem';
import { ethers } from 'ethers';
import { ERC20_ABI, DONATION_ABI } from 'utils/abi';
import { MUSD_ADDRESS } from 'utils/constants';
import { readContract, writeContract } from 'utils/contract-call';
import * as Haptics from 'expo-haptics';

const DONATION_CONTRACT_ADDRESS = '0xcF29Ff894674775841F60Aa2a3c373DE27A8df2b';

const DonationsBottomSheet = () => {
  const { donationsBottomSheetRef, selectedDonation, close } = useBottomSheetContext();
  const { wallets, viem } = useReactiveClient(dynamicClient);
  const insets = useSafeAreaInsets();
  const [customAmount, setCustomAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Reset form when donation is cleared (sheet closes)
  useEffect(() => {
    if (!selectedDonation) {
      setCustomAmount('');
    }
  }, [selectedDonation]);

  const snapPoints = useMemo(() => {
    // Adjust height based on content
    return [1, '85%'];
  }, []);

  const presetAmounts = selectedDonation?.amounts || [];
  const handleAmountSelect = (amount: number) => {
    setCustomAmount(amount.toString());
  };

  const handleCustomAmountChange = (value: string) => {
    // Only allow numbers and decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    setCustomAmount(numericValue);
  };

  const getDonationAmount = () => {
    return customAmount ? parseFloat(customAmount) : null;
  };

  const handleContribute = async () => {
    const amount = getDonationAmount();
    if (!amount || amount <= 0 || !selectedDonation) {
      return;
    }

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
        Alert.alert('Error', 'No wallet connected');
        setIsLoading(false);
        return;
      }

      setLoadingMessage('Connecting to wallet...');

      const publicClient = viem.createPublicClient({
        chain: mezoTestnet
      });

      const walletClient = await viem.createWalletClient({
        chain: mezoTestnet,
        wallet: primaryWallet
      });

      if (!walletClient || !publicClient) {
        Alert.alert('Error', 'Failed to create wallet client');
        setIsLoading(false);
        return;
      }

      setLoadingMessage('Preparing permit signature...');

      const amountInWei = BigInt(ethers.parseEther(amount.toString()));
      
      // Get nonce for permit
      const nonce = (await readContract(publicClient, {
        address: MUSD_ADDRESS,
        abi: ERC20_ABI as Abi,
        functionName: 'nonces',
        args: [walletClient.account.address]
      })) as bigint;

      // Set deadline to 1 hour from now
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);

      console.log('Creating permit signature...');
      setLoadingMessage('Signing permit...');

      // Get token name for domain
      const tokenName = await publicClient.readContract({
        address: MUSD_ADDRESS,
        abi: [
          {
            inputs: [],
            name: 'name',
            outputs: [{ internalType: 'string', name: '', type: 'string' }],
            stateMutability: 'view',
            type: 'function',
          },
        ],
        functionName: 'name',
      }) as string;

      // Create permit signature using signTypedData
      // Note: viem should handle BigInt, but Dynamic Labs might need string conversion
      const permitSignature = await walletClient.signTypedData({
        account: walletClient.account,
        domain: {
          name: tokenName,
          version: '1',
          chainId: mezoTestnet.id,
          verifyingContract: getAddress(MUSD_ADDRESS),
        },
        types: {
          Permit: [
            { name: 'owner', type: 'address' },
            { name: 'spender', type: 'address' },
            { name: 'value', type: 'uint256' },
            { name: 'nonce', type: 'uint256' },
            { name: 'deadline', type: 'uint256' },
          ],
        },
        primaryType: 'Permit',
        message: {
          owner: walletClient.account.address,
          spender: getAddress(DONATION_CONTRACT_ADDRESS),
          value: amountInWei.toString() as any,
          nonce: nonce.toString() as any,
          deadline: deadline.toString() as any,
        },
      });

      // Split signature into r, s, v
      const signature = permitSignature.slice(2); // Remove 0x prefix
      const r = `0x${signature.slice(0, 64)}` as `0x${string}`;
      const s = `0x${signature.slice(64, 128)}` as `0x${string}`;
      const v = parseInt(signature.slice(128, 130), 16) as number;

      console.log('Processing donation with permit...');
      setLoadingMessage('Processing donation...');

      // Use the donation name as beneficiaryId
      const beneficiaryId = selectedDonation.name;
      console.log('Beneficiary ID:', beneficiaryId);

      // Encode the function data in hex format
      const encodedData = encodeFunctionData({
        abi: DONATION_ABI as Abi,
        functionName: 'donateWithPermit',
        args: [beneficiaryId, amountInWei, deadline, v, r, s],
      });

      console.log('Encoded transaction data (hex):', encodedData);
      console.log('Transaction parameters:', {
        beneficiaryId,
        amountInWei: amountInWei.toString(),
        deadline: deadline.toString(),
        v,
        r,
        s,
      });

      const donateReceipt = await writeContract(publicClient, walletClient, {
        account: walletClient.account,
        to: DONATION_CONTRACT_ADDRESS,
        chain: mezoTestnet,
        data: encodedData,
        gas: 5000000n,
      });
      console.log('Donation receipt:', donateReceipt);
      if (donateReceipt.status === 'success') {
        setLoadingMessage('Donation successful!');
        Alert.alert('Success', `Successfully donated ${amount} MUSD to ${selectedDonation.name}!`);
        setCustomAmount('');
        setTimeout(() => {
          close('donations');
        }, 1000);
      } else {
        Alert.alert('Error', 'Donation transaction failed');
        setIsLoading(false);
        setLoadingMessage('');
      }
    } catch (error) {
      console.error('Donation failed:', error);
      Alert.alert('Error', 'Failed to process donation. Please try again.');
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleTermsPress = () => {
    // TODO: Add actual terms URL
    Linking.openURL('https://testnet.mezo.org/terms');
  };

  const handleClose = () => {
    setCustomAmount('');
  };

  return (
    <BottomSheet
      ref={donationsBottomSheetRef}
      snapPoints={snapPoints}
      index={-1}
      enablePanDownToClose
      onClose={handleClose}
      backdropComponent={(props) => <BottomSheetBackdrop {...props} />}>
      <BottomSheetScrollView
        className="px-5 pt-5"
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20) + 80 }}
        showsVerticalScrollIndicator={false}>
          {selectedDonation ? (
            <>
              {/* Donation Image */}
              <View className="mb-6 items-center">
                <Image
                  source={selectedDonation.image}
                  className="h-48 w-full rounded-lg"
                  resizeMode="cover"
                />
              </View>

              {/* Donation Details */}
              <View className="mb-8 flex-1">{selectedDonation.details}</View>

              {/* Donation Form */}
              <View className="mb-6">
                <Text className="mb-4 font-satoshiSemiBold text-xl">Choose an amount</Text>

                {/* Preset Amount Buttons */}
                <View className="mb-4 flex-row flex-wrap gap-2.5">
                  {presetAmounts.map((amount) => (
                    <TouchableOpacity
                      key={amount}
                      onPress={() => handleAmountSelect(amount)}
                      activeOpacity={0.8}
                      className="rounded-xl bg-gray-200 px-3 py-1.5 min-w-16"
                    >
                      <Text className="font-satoshiMedium text-base text-gray-700">
                        {amount} MUSD
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Custom Amount Input */}
                <View className="mb-6">
                  <View className="flex-row items-center rounded-lg border border-gray-300 bg-white">
                    <TextInput
                      value={customAmount}
                      onChangeText={handleCustomAmountChange}
                      placeholder="Enter amount"
                      keyboardType="numeric"
                      className="flex-1 font-satoshiRegular p-4 text-lg leading-tight text-black"
                      placeholderTextColor="#9CA3AF"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <Text className="pr-4 font-satoshiSemiBold text-2xl text-black">MUSD</Text>
                  </View>
                </View>

                {/* Terms of Use */}
                <View className="mb-6 items-center">
                  <Text className="text-center font-satoshiRegular text-sm text-gray-600">
                    By contributing, you accept Mezo&apos;s{' '}
                    <Text
                      onPress={handleTermsPress}
                      className="underline"
                    >
                      Terms of Use
                    </Text>
                  </Text>
                </View>

                {/* Contribute Button */}
                <TouchableOpacity
                  onPress={handleContribute}
                  activeOpacity={0.8}
                  disabled={!getDonationAmount() || getDonationAmount()! <= 0 || isLoading}
                  className={cn(
                    'w-full rounded-xl py-4',
                    isLoading || !getDonationAmount() || getDonationAmount()! <= 0
                      ? 'bg-gray-300'
                      : 'bg-primary'
                  )}
                >
                  {isLoading ? (
                    <View className="flex-row items-center justify-center gap-3">
                      <ActivityIndicator size="small" color="white" />
                      <Text className="text-center font-satoshiSemiBold text-lg text-white">
                        {loadingMessage || 'Processing...'}
                      </Text>
                    </View>
                  ) : (
                    <Text
                      className={cn(
                        'text-center font-satoshiSemiBold text-lg',
                        getDonationAmount() && getDonationAmount()! > 0
                          ? 'text-white'
                          : 'text-gray-500'
                      )}
                    >
                      Contribute with MUSD
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View className="items-center gap-2">
              <Text className="text-sm">No donation selected</Text>
            </View>
          )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

export default DonationsBottomSheet;

