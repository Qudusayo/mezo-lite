import { View, Text, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { DONATIONS } from 'utils/constants';

const More = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="mb-3 p-4 pb-0">
        <Text className="font-satoshiSemiBold text-3xl">More</Text>
      </View>
      <ScrollView className="px-4">
        {Object.values(DONATIONS).map((donation) => (
          <MoreItem
            key={donation.name}
            title={donation.name}
            description={donation.description}
            image={donation.image}
            onPress={() => {}}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const MoreItem = ({
  title,
  description,
  image,
  onPress,
}: {
  title: string;
  description: string;
  image: ImageSourcePropType;
  onPress: () => void;
}) => {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} className="my-2">
      <View className="flex-row items-center gap-4">
        <Image source={image} className="size-16 rounded-lg" />
        <View className="flex-1">
          <Text className="font-satoshiMedium text-xl">{title}</Text>
          <Text className="line-clamp-1 overflow-hidden text-ellipsis font-sans text-base leading-5">
            {description}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default More;
