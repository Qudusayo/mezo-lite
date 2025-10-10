// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
const MUSD_TOKEN = "0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503";

const CashlinkEscrowModule = buildModule("CashlinkEscrowModule", (m) => {
  const cashlinkEscrow = m.contract("CashlinkEscrow", [MUSD_TOKEN]);

  return { cashlinkEscrow };
});

export default CashlinkEscrowModule;
