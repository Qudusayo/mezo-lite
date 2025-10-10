import {
  PrepareTransactionRequestParameters,
  PublicClient,
  ReadContractParameters,
  WalletClient,
} from 'viem';

async function readContract(
  publicClient: PublicClient,
  readContractParams: ReadContractParameters
) {
  const result = await publicClient.readContract(readContractParams);
  console.log('RESULT: ', result);
  return result;
}

async function writeContract(
  publicClient: PublicClient,
  walletClient: WalletClient,
  prepareTransactionRequestParams: PrepareTransactionRequestParameters
) {
  // Prepare transaction request
  const request = await publicClient.prepareTransactionRequest(prepareTransactionRequestParams);

  // Sign the transaction
  const serializedTransaction = await walletClient.signTransaction(request);

  // Send the raw transaction
  const hash = await publicClient.sendRawTransaction({ serializedTransaction });

  // Wait for confirmation
  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  return receipt;
}

export { readContract, writeContract };
