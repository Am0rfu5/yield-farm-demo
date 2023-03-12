
# YieldFarm Project

This repository contains an example project for a basic Yield Farming application built on Ethereum. It demonstrates the creation of a simple smart contract for depositing Ether, accruing yield over time, and withdrawing your balance with interest. This project is intended as an educational tool to help developers understand the principles of yield farming and smart contract development with Solidity and Ethereum.

## Overview

The `YieldFarm` smart contract allows users to deposit ETH into a pool, earn yields based on a predefined rate, and withdraw their initial deposit along with the accrued interest after a certain lock period. This example aims to illustrate the basics of contract interaction, Ether handling, and interest calculation in a decentralized finance (DeFi) context.

## Features

- **Deposit Functionality:** Users can deposit ETH into the yield farming pool.
- **Withdraw Functionality:** Users can withdraw their initial deposit along with the accrued interest after the lock period.
- **Interest Accrual:** A simple fixed interest rate is applied to the deposits.
- **Lock Period:** Withdrawals are locked for a predefined duration to simulate the locking mechanism typical in yield farming contracts.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) and npm installed.
- [MetaMask](https://metamask.io/) or another Ethereum wallet.
- [Foundry](https://getfoundry.sh/) for Ethereum development and testing.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Am0rfu5/yieldfarm.git
   ```
2. Navigate to the project directory:
   ```bash
   cd yieldfarm-example
   ```

## Smart Contract Development

The `YieldFarm` smart contract is developed in Solidity and can be found in the `src` directory. It includes functions for depositing and withdrawing ETH, as well as viewing the current pool status.

### Deployment

You will need a test network or local Ethereum network to deploy the smart contract. You can use [Anvil](https://book.getfoundry.sh/reference/anvil/) for a local test network, or deploy to a public testnet such as Goerli or Sepolia.

To deploy the smart contract to a local Ethereum network using Anvil, start the Anvil local Ethereum network:
```bash
anvil
```

The command prompt will display the RPC URL for the local network and some private keys. Copy on of the private keys and the URL to deploy the smart contract using forge:

```bash
forge create --rpc-url http://localhost:8545 --private-key <PRIVATE_KEY> --contract src/YieldFarm.sol:YieldFarm
```

### Testing

To run tests on the smart contract, use Foundry:
```bash
forge test
```

### Running the Web App

This is a very simple interface for interacting with the `YieldFarm` smart contract. It allows users to deposit ETH, view the pool's status, and withdraw their investment after the lock period.

1. Navigate to the `yield-farm-frontend` directory:
   ```bash
   cd yield-farm-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React frontend application:
   ```bash
   npm start
   ```
   This will launch the application in your browser.
4. Connect your MetaMask wallet when prompted by the application.
5. Use the interface to deposit ETH, view the pool's status, and withdraw your investment.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.