import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, Alert, Clipboard, Share } from 'react-native';
import { useBottomSheetContext } from 'context/bottom-sheet';
import { useGlobalContext } from 'context/global-context';
import { cn, formatAddress, formatAmount, formatDate } from 'utils';
import { CASHLINK_ESCROW_ADDRESS } from 'utils/constants';
import * as WebBrowser from 'expo-web-browser';
import { CopyIcon, ShareIcon } from 'components/icons';

const TransactionBottomSheet = () => {
  const { transactionBottomSheetRef, selectedTransaction } = useBottomSheetContext();
  const { cashlinks } = useGlobalContext();

  const isCashLink = useMemo(() => {
    if (!selectedTransaction) return false;
    return (
      selectedTransaction.from.toLowerCase() === CASHLINK_ESCROW_ADDRESS.toLowerCase() ||
      selectedTransaction.to.toLowerCase() === CASHLINK_ESCROW_ADDRESS.toLowerCase()
    );
  }, [selectedTransaction]);

  // Find the associated cashlink for this transaction
  const associatedCashLink = useMemo(() => {
    if (!selectedTransaction || !isCashLink) return null;
    return cashlinks.find((cashlink) => cashlink.transactionHash === selectedTransaction.hash);
  }, [selectedTransaction, cashlinks, isCashLink]);

  // Check if this is a cashlink creation (user sending to contract)
  const isCashLinkCreation = useMemo(() => {
    if (!selectedTransaction) return false;
    return (
      !selectedTransaction.isReceiving &&
      selectedTransaction.to.toLowerCase() === CASHLINK_ESCROW_ADDRESS.toLowerCase()
    );
  }, [selectedTransaction]);

  const snapPoints = useMemo(() => {
    // Increase height when showing cashlink code
    if (isCashLinkCreation && associatedCashLink) {
      return [1, '70%'];
    }
    return [1, '55%'];
  }, [isCashLinkCreation, associatedCashLink]);

  const amountText = useMemo(() => {
    if (!selectedTransaction) return '';
    const { value, tokenInfo, isReceiving } = selectedTransaction;
    const formatted = Number(formatAmount(Number(value), tokenInfo.decimals)).toFixed(2);
    return `${isReceiving ? '+' : '-'}${formatted} ${tokenInfo.symbol}`;
  }, [selectedTransaction]);

  const titleText = useMemo(() => {
    if (!selectedTransaction) return '';
    return selectedTransaction.isReceiving ? "You've received" : "You've sent";
  }, [selectedTransaction]);

  const explorerUrl = useMemo(() => {
    if (!selectedTransaction) return undefined;
    return `https://explorer.test.mezo.org/tx/${selectedTransaction.hash}`;
  }, [selectedTransaction]);

  const openInApp = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  };

  const copyCashLinkCode = async () => {
    if (!associatedCashLink) return;

    try {
      Clipboard.setString(associatedCashLink.code);
      Alert.alert('Copied!', 'CashLink code copied to clipboard');
    } catch {
      Alert.alert('Error', 'Failed to copy code to clipboard');
    }
  };

  const shareCashLinkCode = async () => {
    if (!associatedCashLink) return;

    try {
      const shareMessage = `Check out this CashLink: ${associatedCashLink.code}`;

      await Share.share({
        message: shareMessage,
        title: 'CashLink'
      });
    } catch {
      Alert.alert('Error', 'Failed to share CashLink');
    }
  };

  return (
    <BottomSheet
      ref={transactionBottomSheetRef}
      snapPoints={snapPoints}
      index={-1}
      enablePanDownToClose
      backdropComponent={(props) => <BottomSheetBackdrop {...props} />}
    >
      <BottomSheetView className="relative items-center gap-12 p-5 pb-20 pt-9">
        {selectedTransaction ? (
          <>
            <View className="items-center gap-2">
              <Text className="text-sm">{titleText}</Text>
              <Text
                className={cn(
                  'font-satoshiSemiBold text-4xl',
                  selectedTransaction.isReceiving ? 'text-success' : 'text-error'
                )}
              >
                {amountText}
              </Text>
              <Text className="">{formatDate(selectedTransaction.timestamp)}</Text>
            </View>

            <View className="w-full gap-3">
              {selectedTransaction.isReceiving ? (
                <View className="flex-row justify-between">
                  <Text className="text-gray-500">From</Text>
                  <Text className="font-satoshiSemiBold">
                    {isCashLink ? 'CASH LINK' : formatAddress(selectedTransaction.from)}
                  </Text>
                </View>
              ) : (
                <View className="flex-row justify-between">
                  <Text className="text-gray-500">To</Text>
                  <Text className="font-satoshiSemiBold">
                    {isCashLink ? 'CASH LINK' : formatAddress(selectedTransaction.to)}
                  </Text>
                </View>
              )}
              <View className="flex-row justify-between">
                <Text className="text-gray-500">Hash</Text>
                <Text className="font-satoshi">{formatAddress(selectedTransaction.hash)}</Text>
              </View>
            </View>

            {/* CashLink Code Section - Show when user created a cashlink */}
            {isCashLinkCreation && associatedCashLink && (
              <View className="w-full gap-3">
                <View className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <Text className="mb-2 font-satoshiSemiBold">
                    Your CashLink Code
                  </Text>
                  <View className="flex-row items-center gap-3">
                    <View className="flex-1 rounded-lg bg-white p-3">
                      <Text
                        className="text-center font-satoshiMedium text-base"
                        numberOfLines={1}
                        ellipsizeMode="middle"
                      >
                        { process.env.EXPO_PUBLIC_WEB_URI }/{associatedCashLink.code}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-4">
                      <TouchableOpacity activeOpacity={0.8} onPress={copyCashLinkCode}>
                        <CopyIcon color="black" width={24} height={24} />
                      </TouchableOpacity>
                      <TouchableOpacity activeOpacity={0.8} onPress={shareCashLinkCode}>
                        <ShareIcon color="black" width={24} height={24} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {!!explorerUrl && (
              <TouchableOpacity
                activeOpacity={0.8}
                className="w-full rounded-lg bg-primary p-4"
                onPress={() => openInApp(explorerUrl)}
              >
                <Text className="self-center font-satoshiMedium text-base">View on explorer</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View className="items-center gap-2">
            <Text className="text-sm">No transaction selected</Text>
          </View>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
};

export default TransactionBottomSheet;
