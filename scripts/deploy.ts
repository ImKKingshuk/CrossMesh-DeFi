import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy VaultRouter
  const VaultRouter = await ethers.getContractFactory("VaultRouter");
  const vaultRouter = await VaultRouter.deploy();
  await vaultRouter.waitForDeployment();
  console.log("VaultRouter deployed to:", await vaultRouter.getAddress());

  // Deploy GovernanceDAO
  const GovernanceDAO = await ethers.getContractFactory("GovernanceDAO");
  const governanceDAO = await GovernanceDAO.deploy();
  await governanceDAO.waitForDeployment();
  console.log("GovernanceDAO deployed to:", await governanceDAO.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
