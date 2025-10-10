import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import WithArrowBack from 'layout/WithArrowBack';
import { InfoCircleIcon } from 'components/icons';
import { Link } from 'expo-router';

export default function CashLinkScreen() {
  return (
    <WithArrowBack>
      {/* Content */}
      <View className="flex-1 pt-4">
        <Text className="mb-2 font-satoshiSemiBold text-4xl">Send with Cash Link</Text>

        <View className="mb-8 flex-row items-center gap-2">
          <InfoCircleIcon color="black" />
          <Text className="font-satoshiSemiBold text-lg">How it works</Text>
        </View>

        <View className="flex-1">
          <CashLinkStep step={1} title="Deposit to the Cash Link" description="From your wallet" />
          <CashLinkStep
            step={2}
            title="Share the link"
            description="Anyone with the link can claim the cash"
          />
          <CashLinkStep
            step={3}
            title="Cash is received by your friend"
            description="When they join Mezo lite"
            isLast
          />
        </View>
      </View>

      {/* Next Button */}
      <View className="px-5 pb-5">
        <Link href="/amount?cashLink=true" asChild>
          <TouchableOpacity className="items-center rounded-xl bg-primary py-4">
            <Text className="font-satoshiSemiBold text-lg text-black">Next</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </WithArrowBack>
  );
}

const CashLinkStep = ({
  step,
  title,
  description,
  isLast = false,
}: {
  step: number;
  title: string;
  description: string;
  isLast?: boolean;
}) => {
  return (
    <View className="mb-5 flex-row items-center">
      <View className="mr-5 items-center">
        <View className="size-10 items-center justify-center rounded-full bg-primary">
          <Text className="font-satoshiSemiBold text-lg text-black">{step}</Text>
        </View>
        {isLast ? null : (
          <View className="absolute -bottom-6 h-0.5 w-11 flex-1 rotate-90  bg-black" />
        )}
      </View>
      <View className="flex-1 pt-2">
        <Text className="font-satoshiSemiBold text-lg text-black">{title}</Text>
        <Text className="text-sm text-[#8E8E93]">{description}</Text>
      </View>
    </View>
  );
};
