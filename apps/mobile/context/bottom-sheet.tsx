// Create a context for the BottomSheet
import type BottomSheet from '@gorhom/bottom-sheet';
import React, { createContext, useRef, useState } from 'react';
import { Transaction } from '../types';

type bottomSheetTypes = 'transaction' | 'courseOrder' | 'gradeSettings';
interface BottomSheetContextType {
  activeResultId: string | undefined;
  setActiveResultId: React.Dispatch<React.SetStateAction<string | undefined>>;
  transactionBottomSheetRef: React.RefObject<BottomSheet | null>;
  open: (type: bottomSheetTypes, payload?: { transaction?: Transaction }) => void;
  close: (type: bottomSheetTypes) => void;
  selectedTransaction: Transaction | null;
  setSelectedTransaction: React.Dispatch<React.SetStateAction<Transaction | null>>;
}

const BottomSheetContext = createContext<BottomSheetContextType | null>(null);

export const BottomSheetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const transactionBottomSheetRef = useRef<BottomSheet | null>(null);
  const [activeResultId, setActiveResultId] = useState<string | undefined>(undefined);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const open = (type: bottomSheetTypes, payload?: { transaction?: Transaction }) => {
    switch (type) {
      case 'transaction':
        if (payload?.transaction) setSelectedTransaction(payload.transaction);
        transactionBottomSheetRef.current?.snapToIndex(1);
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
        selectedTransaction,
        setSelectedTransaction
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
