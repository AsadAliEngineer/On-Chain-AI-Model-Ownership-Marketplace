const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AIModelMarketplace Contract", function () {
  let AIModelMarketplace;
  let aituToken;
  let marketplace;
  let owner, buyer, seller;
  const initialSupply = 5000; // Example token supply
  const modelPrice = ethers.utils.parseUnits("1", "ether"); // Price for AI model in tokens

  beforeEach(async function () {
    // Get signers (deployer, buyer, and seller)
    [owner, buyer, seller] = await ethers.getSigners();

    // Deploy the ERC-20 Token contract (AITU_Nurassyl)
    const TokenFactory = await ethers.getContractFactory("AITU_Nurassyl_Modified");
    aituToken = await TokenFactory.deploy(initialSupply * 10 ** 18); // Initial supply in smallest units (e.g., wei for tokens)
    await aituToken.deployed();

    // Deploy the AI Model Marketplace contract, passing the token address
    const MarketplaceFactory = await ethers.getContractFactory("AIModelMarketplace");
    marketplace = await MarketplaceFactory.deploy(aituToken.address);
    await marketplace.deployed();

    // Transfer tokens to the buyer for testing purposes
    await aituToken.transfer(buyer.address, ethers.utils.parseUnits("100", "ether"));
  });

  describe("Listing and Buying Models", function () {
    it("Should list a new AI model", async function () {
      const modelName = "AI Model 1";
      const modelDescription = "Description of AI Model 1";

      // Seller lists a model for sale
      await marketplace.connect(seller).listModel(modelName, modelDescription, modelPrice);

      // Fetch model details from the marketplace
      const model = await marketplace.models(1);

      // Verify model details
      expect(model.name).to.equal(modelName);
      expect(model.description).to.equal(modelDescription);
      expect(model.price.toString()).to.equal(modelPrice.toString());
      expect(model.seller).to.equal(seller.address);
      expect(model.isSold).to.equal(false);
    });

    it("Should allow the buyer to purchase a model", async function () {
      const modelName = "AI Model 2";
      const modelDescription = "Description of AI Model 2";

      // Seller lists a model
      await marketplace.connect(seller).listModel(modelName, modelDescription, modelPrice);

      // Buyer purchases the model
      await aituToken.connect(buyer).approve(marketplace.address, modelPrice);
      await marketplace.connect(buyer).purchaseModel(1);

      // Verify that the model is marked as sold
      const model = await marketplace.models(1);
      expect(model.isSold).to.equal(true);

      // Check buyer's token balance after purchase
      const buyerBalance = await aituToken.balanceOf(buyer.address);
      expect(buyerBalance.toString()).to.equal(ethers.utils.parseUnits("99", "ether").toString()); // 100 - 1 token for the model

      // Check seller's token balance after receiving payment
      const sellerBalance = await aituToken.balanceOf(seller.address);
      expect(sellerBalance.toString()).to.equal(ethers.utils.parseUnits("1", "ether").toString()); // Seller receives 1 token
    });

    it("Should emit the ModelPurchased event on successful purchase", async function () {
      const modelName = "AI Model 3";
      const modelDescription = "Description of AI Model 3";

      // Seller lists a model
      await marketplace.connect(seller).listModel(modelName, modelDescription, modelPrice);

      // Buyer purchases the model and expects the ModelPurchased event to be emitted
      await expect(marketplace.connect(buyer).purchaseModel(1))
        .to.emit(marketplace, "ModelPurchased")
        .withArgs(1, buyer.address);
    });

    it("Should fail if the buyer does not have enough tokens to purchase", async function () {
      const modelName = "AI Model 4";
      const modelDescription = "Description of AI Model 4";

      // Seller lists a model
      await marketplace.connect(seller).listModel(modelName, modelDescription, modelPrice);

      // Buyer tries to purchase the model without enough tokens (only 0.5 tokens)
      await expect(marketplace.connect(buyer).purchaseModel(1)).to.be.revertedWith("Insufficient token balance");
    });

    it("Should fail if a model has already been sold", async function () {
      const modelName = "AI Model 5";
      const modelDescription = "Description of AI Model 5";

      // Seller lists a model
      await marketplace.connect(seller).listModel(modelName, modelDescription, modelPrice);

      // Buyer purchases the model
      await aituToken.connect(buyer).approve(marketplace.address, modelPrice);
      await marketplace.connect(buyer).purchaseModel(1);

      // Trying to purchase again should fail as the model is already sold
      await expect(marketplace.connect(buyer).purchaseModel(1)).to.be.revertedWith("Model already sold");
    });
  });

  describe("Transaction Info Tracking", function () {
    it("Should track the last transaction details correctly", async function () {
      const modelName = "AI Model 6";
      const modelDescription = "Description of AI Model 6";

      // Seller lists a model
      await marketplace.connect(seller).listModel(modelName, modelDescription, modelPrice);

      // Buyer purchases the model
      await aituToken.connect(buyer).approve(marketplace.address, modelPrice);
      await marketplace.connect(buyer).purchaseModel(1);

      // Verify last transaction details
      const lastSender = await marketplace.getLastTransactionSender();
      const lastReceiver = await marketplace.getLastTransactionReceiver();
      const lastTimestamp = await marketplace.getLastTransactionTimestamp();

      expect(lastSender).to.equal(buyer.address);
      expect(lastReceiver).to.equal(seller.address);
      expect(lastTimestamp).to.include("Timestamp:");
    });
  });
});
