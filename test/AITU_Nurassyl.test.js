const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AITU_Nurassyl ERC-20 Token", function () {
  let AITU_Nurassyl;
  let aituToken;
  let owner, addr1, addr2;
  const initialSupply = 2000;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy the AITU_Nurassyl ERC-20 token contract
    const TokenFactory = await ethers.getContractFactory("AITU_Nurassyl");
    aituToken = await TokenFactory.deploy();
    await aituToken.deployed();
  });

  describe("Deployment", function () {
    it("Should deploy with the correct name and symbol", async function () {
      expect(await aituToken.name()).to.equal("AITU_Nurassyl_SE-2327_Token");
      expect(await aituToken.symbol()).to.equal("UTK");
    });

    it("Should assign the total supply to the owner", async function () {
      const ownerBalance = await aituToken.balanceOf(owner.address);
      expect(await aituToken.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      // Owner transfers 100 tokens to addr1
      await aituToken.transfer(addr1.address, 100);
      const addr1Balance = await aituToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(100);

      // Owner transfers 50 tokens to addr2
      await aituToken.transfer(addr2.address, 50);
      const addr2Balance = await aituToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });

    it("Should emit TransactionInfo event on transfer", async function () {
      await expect(aituToken.transfer(addr1.address, 50))
        .to.emit(aituToken, "TransactionInfo")
        .withArgs(owner.address, addr1.address, 50, await aituToken.getLastTransactionTimestamp());
    });

    it("Should fail if sender has insufficient balance", async function () {
      const initialOwnerBalance = await aituToken.balanceOf(owner.address);
      
      // addr1 does not have enough tokens to transfer to addr2
      await expect(aituToken.connect(addr1).transfer(owner.address, 1)).to.be.revertedWith(
        "ERC20: transfer amount exceeds balance"
      );
      
      expect(await aituToken.balanceOf(owner.address)).to.equal(initialOwnerBalance);
    });

    it("Should update last transaction details correctly", async function () {
      await aituToken.transfer(addr1.address, 100);
      
      expect(await aituToken.getLastTransactionSender()).to.equal(owner.address);
      expect(await aituToken.getLastTransactionReceiver()).to.equal(addr1.address);
      expect(await aituToken.getLastTransactionTimestamp()).to.not.equal("0");
    });
  });
});
