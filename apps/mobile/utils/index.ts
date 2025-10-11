import { ethers } from 'ethers';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function formatDate(timestamp: number) {
  const timeStampToFormat = timestamp * 1000;
  const currentTime = Date.now();
  const timeDiff = timeStampToFormat - currentTime;
  let absTimeDiff = Math.abs(timeDiff);

  const timeUnits = [
    { unit: 'year', divisor: 31536000000 },
    { unit: 'month', divisor: 2592000000 },
    { unit: 'week', divisor: 604800000 },
    { unit: 'day', divisor: 86400000 },
    { unit: 'hour', divisor: 3600000 },
    { unit: 'minute', divisor: 60000 },
    { unit: 'second', divisor: 1000 }
  ];

  for (const unitInfo of timeUnits) {
    if (absTimeDiff > unitInfo.divisor) {
      absTimeDiff /= unitInfo.divisor;
      const unitCount = Math.round(absTimeDiff);
      const pluralSuffix = unitCount > 1 ? 's' : '';
      const timeDescription = `${unitCount} ${unitInfo.unit}${pluralSuffix}`;
      return timeDiff >= 0 ? `${timeDescription} from now` : `${timeDescription} ago`;
    }
  }

  return new Date(timeStampToFormat).toLocaleString();
}

const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const formatAmount = (value: string | number, decimals: number) => {
  // Handle both string and number inputs, convert scientific notation properly
  let numericValue: string;

  if (typeof value === 'number') {
    // For very large numbers, use BigInt to avoid scientific notation
    numericValue =
      value > Number.MAX_SAFE_INTEGER ? BigInt(Math.floor(value)).toString() : value.toString();
  } else {
    // Convert scientific notation to proper string if needed
    numericValue = value.includes('e') ? Number(value).toString() : value;
  }

  return ethers.formatUnits(numericValue || '0', decimals);
};

export { formatDate, formatAddress, formatAmount };
