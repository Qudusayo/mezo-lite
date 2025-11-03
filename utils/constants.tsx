import { Text, View } from 'react-native';

export const MUSD_ADDRESS = '0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503';
export const CASHLINK_ESCROW_ADDRESS = '0xD60e914Ff6f3E86B3ACf060AF98152E38702fCcC';
export const DONATION_RECIPIENT_ADDRESS = '0x6e80164ea60673D64d5d6228beb684a1274Bb017';

export const DONATIONS = {
  BRINK: {
    address: '0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503',
    name: 'Brink',
    description: 'Support open source Bitcoin protocol developers.',
    image: require('../assets/others/brink.png'),
    amounts: [5, 10, 20, 50],
    details: (
      <View className="flex-1">
        <Text className="mb-2 font-satoshiSemiBold text-2xl">Donate to Brink</Text>
        <Text className="mb-8 font-sans text-lg leading-5">
          Support open source Bitcoin development with a direct MUSD donation to Brink, a nonprofit
          that funds Bitcoin Core contributors and helps strengthen the network. Learn more at
          brink.dev.
        </Text>

        <Text className="mb-2 font-satoshiSemiBold text-xl">Details</Text>
        <Text className="font-sans text-lg leading-5">
          Brink is entirely funded by donations from people and organizations who care about
          Bitcoin&apos;s future. They provide grants, mentorship, and education to developers around
          the world. Mezo will match up to $50K in MUSD donations.
        </Text>
      </View>
    ),
  },
  SHEFI: {
    address: '0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503',
    name: 'Shefi',
    description: 'Support education and inclusion for women in Web3 and crypto',
    image: require('../assets/others/shefi.png'),
    amounts: [5, 10, 20, 50],
    details: (
      <View className="flex-1">
        <Text className="mb-2 font-satoshiSemiBold text-2xl">Contribute to SheFi</Text>
        <Text className="mb-8 font-sans text-lg leading-5">
          SheFi is an 8-week program and global community helping women and nonbinary folks master
          crypto and Web3 through hands-on learning, peer collaboration, and practical experience.
          Learn more at shefi.org.
        </Text>

        <Text className="mb-2 font-satoshiSemiBold text-xl">Details</Text>
        <Text className="font-sans text-lg leading-5">
          Your MUSD contributions will go to SheFi to provide women and nonbinary scholars the
          opportunity to join the course. Mezo will match up to $50K worth of contributions in MUSD.
        </Text>
      </View>
    ),
  },
};
