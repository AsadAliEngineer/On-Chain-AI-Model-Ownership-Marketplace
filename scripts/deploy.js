const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Разворачиваем ERC20 токен
    const Token = await hre.ethers.getContractFactory("ERC20_smart_contract");
    const token = await Token.deploy(1000000); // Начальное количество токенов
    console.log("Token deployed to:", await token.getAddress());

    // Разворачиваем маркетплейс, передавая адрес токена
    const Marketplace = await hre.ethers.getContractFactory("AIModelMarketplace");
    const marketplace = await Marketplace.deploy(await token.getAddress());
    console.log("Marketplace deployed to:", await marketplace.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
