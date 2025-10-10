/**
 * API service for Mezo blockchain data
 * 
 * This service provides methods to fetch token transfers and other blockchain data
 * from the Mezo testnet explorer API.
 */

// Types based on the API response structure
export interface TokenTransfer {
  block_number: number;
  from: {
    hash: string;
    ens_domain_name: string | null;
    is_contract: boolean;
    is_scam: boolean;
    is_verified: boolean;
    name: string | null;
  };
  to: {
    hash: string;
    ens_domain_name: string | null;
    is_contract: boolean;
    is_scam: boolean;
    is_verified: boolean;
    name: string | null;
  };
  log_index: number;
  method: string;
  timestamp: string;
  token: {
    address: string;
    decimals: string;
    name: string;
    symbol: string;
    type: string;
  };
  total: {
    decimals: string;
    value: string;
  };
  transaction_hash: string;
  tx_hash: string;
  type: string;
}

export interface TokenTransfersResponse {
  items: TokenTransfer[];
  next_page_params: any;
}

export interface ProcessedTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  blockNumber: number;
  timestamp: number;
  isReceiving: boolean;
  tokenInfo: {
    decimals: number;
    symbol: string;
    name: string;
  };
}

class MezoApiService {
  private baseUrl = 'https://api.explorer.test.mezo.org/api/v2';

  /**
   * Fetch token transfers for a specific address
   */
  async getTokenTransfers(
    address: string,
    tokenAddress: string,
    options: {
      type?: string;
      filter?: string;
      page?: number;
    } = {}
  ): Promise<TokenTransfersResponse> {
    const params = new URLSearchParams({
      type: options.type || 'ERC-20',
      filter: options.filter || 'to | from',
      token: tokenAddress,
    });

    if (options.page) {
      params.append('page', options.page.toString());
    }

    const url = `${this.baseUrl}/addresses/${address}/token-transfers?${params.toString()}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data: TokenTransfersResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching token transfers:', error);
      throw error;
    }
  }

  /**
   * Process raw API response into our internal transaction format
   */
  processTransactions(
    transfers: TokenTransfer[],
    walletAddress: string
  ): ProcessedTransaction[] {
    return transfers.map((transfer) => {
      const isReceiving = transfer.to.hash.toLowerCase() === walletAddress.toLowerCase();
      
      return {
        hash: transfer.tx_hash,
        from: transfer.from.hash,
        to: transfer.to.hash,
        value: transfer.total.value,
        blockNumber: transfer.block_number,
        timestamp: new Date(transfer.timestamp).getTime() / 1000, // Convert to Unix timestamp
        isReceiving,
        tokenInfo: {
          decimals: parseInt(transfer.token.decimals),
          symbol: transfer.token.symbol,
          name: transfer.token.name,
        },
      };
    });
  }

  /**
   * Create a map of transactions keyed by transaction hash
   */
  createTransactionMap(transactions: ProcessedTransaction[]): Map<string, ProcessedTransaction> {
    const map = new Map<string, ProcessedTransaction>();
    transactions.forEach((tx) => {
      map.set(tx.hash, tx);
    });
    return map;
  }
}

// Export singleton instance
export const mezoApi = new MezoApiService();
