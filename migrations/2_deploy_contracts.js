const AITU_Nurassyl = artifacts.require("AITU_Nurassyl_Modified");
const AIModelMarketplace = artifacts.require("AIModelMarketplace");

module.exports = async function (deployer, network, accounts) {
  // Deploy the ERC-20 token contract (AITU_Nurassyl)
  const initialSupply = 5000; // Example: 5000 tokens
  await deployer.deploy(AITU_Nurassyl, initialSupply * 10 ** 18);  // Adjust token supply in smallest units (e.g., 5000 tokens * 10^18)
  const token = await AITU_Nurassyl.deployed();

  console.log("AITU_Nurassyl token deployed at:", token.address);

  // Deploy the AIModelMarketplace contract, passing the token address to the constructor
  await deployer.deploy(AIModelMarketplace, token.address);
  const marketplace = await AIModelMarketplace.deployed();

  console.log("AIModelMarketplace deployed at:", marketplace.address);

  // Optionally, you can initialize some values after deployment if needed
};
