// Create a context for the BottomSheet
import type BottomSheet from '@gorhom/bottom-sheet';
import React, { createContext, useRef, useState } from 'react';
import { Transaction } from '../types';

export type Donation = {
  address: string;
  name: string;
  description: string;
  image: any;
  amounts?: number[];
  details: React.ReactElement;
};

type bottomSheetTypes = 'transaction' | 'depositOptions' | 'donations';
interface BottomSheetContextType {
  activeResultId: string | undefined;
  setActiveResultId: React.Dispatch<React.SetStateAction<string | undefined>>;
  transactionBottomSheetRef: React.RefObject<BottomSheet | null>;
  depositOptionsBottomSheetRef: React.RefObject<BottomSheet | null>;
  donationsBottomSheetRef: React.RefObject<BottomSheet | null>;
  open: (type: bottomSheetTypes, payload?: { transaction?: Transaction; donation?: Donation }) => void;
  close: (type: bottomSheetTypes) => void;
  selectedTransaction: Transaction | null;
  setSelectedTransaction: React.Dispatch<React.SetStateAction<Transaction | null>>;
  selectedDonation: Donation | null;
  setSelectedDonation: React.Dispatch<React.SetStateAction<Donation | null>>;
}

const BottomSheetContext = createContext<BottomSheetContextType | null>(null);

export const BottomSheetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const transactionBottomSheetRef = useRef<BottomSheet | null>(null);
  const depositOptionsBottomSheetRef = useRef<BottomSheet | null>(null);
  const donationsBottomSheetRef = useRef<BottomSheet | null>(null);
  const [activeResultId, setActiveResultId] = useState<string | undefined>(undefined);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);

  const open = (type: bottomSheetTypes, payload?: { transaction?: Transaction; donation?: Donation }) => {
    switch (type) {
      case 'transaction':
        if (payload?.transaction) setSelectedTransaction(payload.transaction);
        transactionBottomSheetRef.current?.snapToIndex(1);
        break;
      case 'depositOptions':
        depositOptionsBottomSheetRef.current?.snapToIndex(1);
        break;
      case 'donations':
        if (payload?.donation) setSelectedDonation(payload.donation);
        donationsBottomSheetRef.current?.snapToIndex(1);
        break;
      default:
        break;
    }
  };
  const close = (type: bottomSheetTypes) => {
    switch (type) {
      case 'transaction':
        transactionBottomSheetRef.current?.close();
        setSelectedTransaction(null);
        break;
      case 'depositOptions':
        depositOptionsBottomSheetRef.current?.close();
        break;
      case 'donations':
        donationsBottomSheetRef.current?.close();
        setSelectedDonation(null);
        break;
      default:
        break;
    }
  };

  return (
    <BottomSheetContext.Provider
      value={{
        open,
        close,
        activeResultId,
        setActiveResultId,
        transactionBottomSheetRef,
        depositOptionsBottomSheetRef,
        donationsBottomSheetRef,
        selectedTransaction,
        setSelectedTransaction,
        selectedDonation,
        setSelectedDonation
      }}
    >
      {children}
    </BottomSheetContext.Provider>
  );
};

export const useBottomSheetContext = () => {
  const context = React.useContext(BottomSheetContext);
  if (!context) {
    throw new Error('useBottomSheetContext must be used within a BottomSheetProvider');
  }
  return context;
};
