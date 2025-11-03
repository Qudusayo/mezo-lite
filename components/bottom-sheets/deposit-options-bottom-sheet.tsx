import { Text, TouchableOpacity, View } from 'react-native';
import React, { useMemo, useRef } from 'react';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useBottomSheetContext } from 'context/bottom-sheet';
import { BankIcon, BinanceIcon, LinkIcon, PremiumRight } from 'components/icons';
import { SvgProps } from 'react-native-svg';
import { Link, useRouter } from 'expo-router';

const DepositOptionsBottomSheet = () => {
  const { depositOptionsBottomSheetRef } = useBottomSheetContext();
  const snapPoints = useMemo(() => [1, '55%'], []);

  return (
    <BottomSheet
      ref={depositOptionsBottomSheetRef}
      snapPoints={snapPoints}
      index={-1}
      enablePanDownToClose
      backdropComponent={(props) => <BottomSheetBackdrop {...props} />}
    >
      <BottomSheetView className="relative gap-4 px-4 pb-20 pt-4">
        <Text className="font-satoshiSemiBold text-2xl">Deposit From</Text>
        <DepositOptions
          icon={BinanceIcon}
          title="Manual Deposit"
          description="Deposit manually using a wallet address"
          href="/"
        />
        <DepositOptions
          icon={LinkIcon}
          title="CashLink"
          description="Enter a cashlink to claim some money"
          href="/claim-cash-link"
        />
        <DepositOptions
          comingSoon
          icon={PremiumRight}
          title="Local Deposit"
          description="Using your local payment method"
        />
        <DepositOptions
          comingSoon
          icon={BankIcon}
          title="Bank Account"
          description="Using a generated virtual account"
        />
      </BottomSheetView>
    </BottomSheet>
  );
};

const DepositOptions = ({
  icon,
  title,
  description,
  comingSoon,
  href
}: {
  icon: React.ComponentType<SvgProps>;
  title: string;
  description: string;
  comingSoon?: boolean;
  href?: string;
}) => {
  const Icon = icon;
  const router = useRouter();
  const { close } = useBottomSheetContext();

  return (
    <TouchableOpacity
      onPress={() => {
        if (href) {
          close('depositOptions');
          router.push(href);
        }
      }}
      activeOpacity={href ? 0.8 : 1}
      className="flex-row items-center gap-4 rounded-xl bg-light/5 border border-light/5 p-4"
    >
      {comingSoon ? (
        <View className="absolute -top-2 right-3  rounded-xl bg-primary px-2 py-0.5">
          <Text className="text-xs text-white">Coming Soon!</Text>
        </View>
      ) : null}
      <Icon color="black" width={32} height={32} />
      <View>
        <Text className="font-satoshiMedium text-lg">{title}</Text>
        <Text className="-mt-2 font-satoshiMedium text-sm text-gray-500">{description}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default DepositOptionsBottomSheet;
