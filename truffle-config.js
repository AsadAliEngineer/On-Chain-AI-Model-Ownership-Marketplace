const HDWalletProvider = require('@truffle/hdwallet-provider');
const fs = require('fs');
const privateKey = "0x5796d5135b91d545183376c9cb0e18c5af73195c7d2bd312391a075536e6aa16";

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 7545,            // Ganache blockchain port
      network_id: "5777",
    },
    sepolia: {
      provider: () => new HDWalletProvider(
        privateKey,
        `https://sepolia.infura.io/v3/d45f026011764712a610bf29e38db3f9`
      ),
      network_id: 11155111,
    }
  },
  compilers: {
    solc: {
      version: "0.6.0"
    }
  }
};
