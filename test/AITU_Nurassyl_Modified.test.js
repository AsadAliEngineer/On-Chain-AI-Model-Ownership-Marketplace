const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AITU_Nurassyl_Modified ERC-20 Token", function () {
  let AITU_Nurassyl_Modified;
  let aituToken;
  let owner, addr1, addr2;
  const initialSupply = 5000;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy the AITU_Nurassyl_Modified ERC-20 token contract
    const TokenFactory = await ethers.getContractFactory("AITU_Nurassyl_Modified");
    aituToken = await TokenFactory.deploy(initialSupply * 10 ** 18); // Mint initial supply
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

  describe("Minting and Burning", function () {
    it("Should mint new tokens", async function () {
      // Mint 1000 tokens to addr1
      await aituToken.mint(addr1.address, 1000 * 10 ** 18);
      const addr1Balance = await aituToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(1000 * 10 ** 18);
    });

    it("Should burn tokens from an address", async function () {
      // Owner burns 100 tokens from its balance
      const initialOwnerBalance = await aituToken.balanceOf(owner.address);
      await aituToken.burn(owner.address, 100 * 10 ** 18);
      const finalOwnerBalance = await aituToken.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance - 100 * 10 ** 18);
    });

    it("Should burn tokens from the contract itself", async function () {
      const initialContractBalance = await aituToken.balanceOf(aituToken.address);
      await aituToken.burnFromContract(100 * 10 ** 18);
      const finalContractBalance = await aituToken.balanceOf(aituToken.address);
      expect(finalContractBalance).to.equal(initialContractBalance - 100 * 10 ** 18);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      // Owner transfers 100 tokens to addr1
      await aituToken.transfer(addr1.address, 100 * 10 ** 18);
      const addr1Balance = await aituToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(100 * 10 ** 18);

      // Owner transfers 50 tokens to addr2
      await aituToken.transfer(addr2.address, 50 * 10 ** 18);
      const addr2Balance = await aituToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50 * 10 ** 18);
    });

    it("Should emit TransactionInfo event on transfer", async function () {
      await expect(aituToken.transfer(addr1.address, 50 * 10 ** 18))
        .to.emit(aituToken, "TransactionInfo")
        .withArgs(owner.address, addr1.address, 50 * 10 ** 18, await aituToken.getLastTransactionTimestamp());
    });

    it("Should fail if sender has insufficient balance", async function () {
      const initialOwnerBalance = await aituToken.balanceOf(owner.address);
      
      // addr1 does not have enough tokens to transfer to addr2
      await expect(aituToken.connect(addr1).transfer(owner.address, 1 * 10 ** 18)).to.be.revertedWith(
        "ERC20: transfer amount exceeds balance"
      );
      
      expect(await aituToken.balanceOf(owner.address)).to.equal(initialOwnerBalance);
    });

    it("Should update last transaction details correctly", async function () {
      await aituToken.transfer(addr1.address, 100 * 10 ** 18);
      
      expect(await aituToken.getLastTransactionSender()).to.equal(owner.address);
      expect(await aituToken.getLastTransactionReceiver()).to.equal(addr1.address);
      expect(await aituToken.getLastTransactionTimestamp()).to.not.equal("0");
    });
  });
});
