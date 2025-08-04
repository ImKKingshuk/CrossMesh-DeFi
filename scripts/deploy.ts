import hre from "hardhat";
import { createWalletClient, http, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { defineChain } from "viem";

async function main() {
  // Define CrossFi chain for viem
  const crossfiTestnet = defineChain({
    id: 4157,
    name: "CrossFi Testnet",
    rpcUrls: { default: { http: ["https://rpc.testnet.ms"] } },
    nativeCurrency: { name: "XFI", symbol: "XFI", decimals: 18 },
  });

  // Wallet client with private key
  const account = privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`);
  const walletClient = createWalletClient({
    account,
    chain: crossfiTestnet,
    transport: http(),
  });

  console.log("Deploying from:", account.address);

  // Fetch artifact for VaultRouter (replaces hre.viem.getContractBytecode)
  const vaultRouterArtifact = await hre.artifacts.readArtifact("VaultRouter");

  // Deploy VaultRouter
  const vaultRouterHash = await walletClient.deployContract({
    abi: vaultRouterArtifact.abi, // Use full ABI from artifact (better than manual parseAbi)
    bytecode: vaultRouterArtifact.bytecode as `0x${string}`, // Bytecode from artifact (cast to satisfy viem's type)
    args: [],
  });

  // Fetch public client (hre.viem.publicClient isn't directly available; use getPublicClient instead)
  const publicClient = await hre.viem.getPublicClient({
    chain: crossfiTestnet,
  });

  const vaultRouterReceipt = await publicClient.waitForTransactionReceipt({
    hash: vaultRouterHash,
  });
  console.log("VaultRouter deployed to:", vaultRouterReceipt.contractAddress);

  // Fetch artifact for GovernanceDAO
  const governanceDAOArtifact = await hre.artifacts.readArtifact(
    "GovernanceDAO"
  );

  // Deploy GovernanceDAO
  const governanceDAOHash = await walletClient.deployContract({
    abi: governanceDAOArtifact.abi,
    bytecode: governanceDAOArtifact.bytecode as `0x${string}`,
    args: [],
  });
  const governanceDAOReceipt = await publicClient.waitForTransactionReceipt({
    hash: governanceDAOHash,
  });
  console.log(
    "GovernanceDAO deployed to:",
    governanceDAOReceipt.contractAddress
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
