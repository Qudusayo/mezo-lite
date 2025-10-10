import { View } from 'react-native';
import Shimmer from './shimmer';

const TransactionShimmer = () => {
  return (
    <View className="mt-4 flex-row items-center justify-between gap-4">
      <Shimmer width={42} height={42} radius={9999} />

      <View className="flex-1">
        <View className="mb-1">
          <Shimmer width="70%" height={16} radius={6} />
        </View>
        <Shimmer width="40%" height={12} radius={6} />
      </View>

      <Shimmer width={50} height={16} radius={6} />
    </View>
  );
};

export default TransactionShimmer;
