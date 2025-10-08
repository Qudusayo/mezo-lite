import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { ethers } from 'ethers';
import Shimmer from './shimmer';

const TokenBalanceDisplay = ({
  walletAddress,
  tokenAddress,
  rpcUrl = 'https://rpc.test.mezo.org',
}: {
  walletAddress: string;
  tokenAddress: string;
  rpcUrl?: string;
}) => {
  const [balance, setBalance] = useState<{ formatted: string; symbol: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const tokenContract = new ethers.Contract(
      tokenAddress,
      [
        'function balanceOf(address) view returns (uint256)',
        'function decimals() view returns (uint8)',
        'function symbol() view returns (string)',
        'event Transfer(address indexed from, address indexed to, uint256 value)',
      ],
      provider
    );

    const fetchBalance = async () => {
      try {
        setLoading(true);
        const [balanceRaw, decimals, symbol] = await Promise.all([
          tokenContract.balanceOf(walletAddress),
          tokenContract.decimals(),
          tokenContract.symbol(),
        ]);

        const formatted = ethers.formatUnits(balanceRaw, decimals);
        setBalance({ formatted, symbol });
        setError(null);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();

    // Set up event listeners for transfers
    const filterTo = tokenContract.filters.Transfer(null, walletAddress);
    const filterFrom = tokenContract.filters.Transfer(walletAddress, null);

    tokenContract.on(filterTo, fetchBalance);
    tokenContract.on(filterFrom, fetchBalance);

    // Cleanup
    return () => {
      tokenContract.removeAllListeners();
    };
  }, [walletAddress, tokenAddress, rpcUrl]);

  if (loading)
    return (
      <View>
        <Shimmer width={100} height={35} radius={8} />
      </View>
    );
  if (error) return <Text>Error: {error}</Text>;
  if (!balance) return <Text>No balance data</Text>;

  return (
    <View>
      <Text className="font-satoshiBold text-4xl text-white">${balance.formatted}</Text>
    </View>
  );
};

export default TokenBalanceDisplay;
