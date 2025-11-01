require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    celoSepolia: {
      url: "https://forno.celo-sepolia.celo-testnet.org",
      accounts: {
        mnemonic: process.env.MNEMONIC || "",
        path: "m/44'/52752'/0'/0",
      },
      chainId: 11142220,
    },
    celo: {
      url: "https://forno.celo.org",
      accounts: {
        mnemonic: process.env.MNEMONIC || "",
        path: "m/44'/52752'/0'/0",
      },
      chainId: 42220,
    },
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
  },
};
