import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useBottomSheetContext } from 'context/bottom-sheet';
import { cn, formatAddress, formatAmount, formatDate } from 'utils';
import { CASHLINK_ESCROW_ADDRESS } from 'utils/constants';
import * as WebBrowser from 'expo-web-browser';

const TransactionBottomSheet = () => {
  const { transactionBottomSheetRef, selectedTransaction } = useBottomSheetContext();

  const isCashLink = useMemo(() => {
    if (!selectedTransaction) return false;
    return (
      selectedTransaction.from.toLowerCase() === CASHLINK_ESCROW_ADDRESS.toLowerCase() ||
      selectedTransaction.to.toLowerCase() === CASHLINK_ESCROW_ADDRESS.toLowerCase()
    );
  }, [selectedTransaction]);

  const snapPoints = useMemo(() => [1, '55%'], []);

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
