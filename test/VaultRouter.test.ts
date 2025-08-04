import { expect } from "chai";
import { ethers } from "hardhat";

describe("VaultRouter", function () {
  it("Should allow deposits and emit event", async function () {
    const VaultRouter = await ethers.getContractFactory("VaultRouter");
    const vaultRouter = await VaultRouter.deploy();
    await vaultRouter.waitForDeployment();

    const tx = await vaultRouter.deposit("Ethereum", "Aave", {
      value: ethers.parseEther("1.0"),
    });
    await tx.wait();

    expect(
      await vaultRouter.deposits(
        await ethers.provider.getSigner(0).getAddress()
      )
    ).to.equal(ethers.parseEther("1.0"));
  });

  it("Should allow withdrawals", async function () {
    const VaultRouter = await ethers.getContractFactory("VaultRouter");
    const vaultRouter = await VaultRouter.deploy();
    await vaultRouter.waitForDeployment();

    await vaultRouter.deposit("Ethereum", "Aave", {
      value: ethers.parseEther("1.0"),
    });

    const tx = await vaultRouter.withdraw(ethers.parseEther("1.0"));
    await tx.wait();

    expect(
      await vaultRouter.deposits(
        await ethers.provider.getSigner(0).getAddress()
      )
    ).to.equal(0);
  });
});
