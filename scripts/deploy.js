const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  // Getting the signers (wallets) that will deploy the contracts
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy the ERC-20 token contract (AITU_Nurassyl)
  const TokenFactory = await ethers.getContractFactory("AITU_Nurassyl_Modified");
  const initialSupply = 5000; // Specify the initial supply for the token
  const token = await TokenFactory.deploy(initialSupply * 10 ** 18);  // Token supply in smallest units (e.g., wei for tokens)
  await token.deployed();

  console.log("AITU_Nurassyl_Modified deployed to:", token.address);

  // Deploy the AI Model Marketplace contract (AIModelMarketplace)
  const MarketplaceFactory = await ethers.getContractFactory("AIModelMarketplace");

  // Deploy the marketplace contract, passing the ERC-20 token address as a constructor parameter
  const marketplace = await MarketplaceFactory.deploy(token.address);
  await marketplace.deployed();

  console.log("AIModelMarketplace deployed to:", marketplace.address);

  // Save the contract addresses to a file for reference
  saveFrontendFiles(token, marketplace);
}

// Function to save the contract addresses and ABIs to the frontend folder
function saveFrontendFiles(token, marketplace) {
  const contractsDir = __dirname + "/../frontend/src/abis";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  // Save the token contract ABI and address
  fs.writeFileSync(
    contractsDir + "/AITU_Nurassyl.json",
    JSON.stringify({
      address: token.address,
      abi: token.interface.format(ethers.utils.FormatTypes.json),
    })
  );

  // Save the marketplace contract ABI and address
  fs.writeFileSync(
    contractsDir + "/AIModelMarketplace.json",
    JSON.stringify({
      address: marketplace.address,
      abi: marketplace.interface.format(ethers.utils.FormatTypes.json),
    })
  );

  console.log("Frontend files have been saved!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
