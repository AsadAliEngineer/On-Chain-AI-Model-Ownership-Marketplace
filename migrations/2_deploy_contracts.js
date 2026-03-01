const AIModelMarketplace = artifacts.require("AImodelMarketplace");

module.exports = async function (deployer, network, accounts) {
  const creatorAccount = accounts[0];  // The account deploying the contract

  // Deploy AIModelMarketplace contract
  await deployer.deploy(AIModelMarketplace, { from: creatorAccount });

  // Optionally, you can initialize some values after deployment if needed
  const aiModelMarketplaceInstance = await AIModelMarketplace.deployed();

  console.log(`AIModelMarketplace deployed at address: ${aiModelMarketplaceInstance.address}`);
};
