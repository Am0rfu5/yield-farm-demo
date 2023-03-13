
# YieldFarm Project

This project is a 'demo' version of a basic Yield Farming Decentralized application built on Ethereum. At the center is the YieldFarm.sol smart contract which allows depositing of Ether, accruing yield over time, and withdrawing the balance with interest. This project is intended as an educational tool to help new developers understand the principles of yield farming and smart contract development with Solidity and Ethereum (and some React).

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
   cd yieldfarm
   ```

## Smart Contract Development

The `YieldFarm` smart contract is developed in Solidity and can be found in the `src` directory. It includes functions for depositing and withdrawing ETH, as well as viewing the current pool status and the interest accrued by a user.

### Deployment

You will need a local test Ethereum network to deploy the smart contract with a corresponding account private key, the RPC URL. Either Hardhat or Anvil can be used to deploy the smart contract.

```bash
anvil
```

Anvil will return the RPC URL (default used below is http://localhost:8545) and the private key of the account that will be used to deploy the smart contract.

To deploy the smart contract on Anvil using Foundry Forge CLI, copy one of the` Private Keys` and run the following command:

```bash
forge create --rpc-url http://localhost:8545 --private-key <PRIVATE_KEY> --contract src/YieldFarm.sol:YieldFarm
```

This will deploy the smart contract and return the contract address.

Copy the contract address and paste it into the `yield-farm-frontend/.env` file.

### Testing the Smart Contract

To run tests on the smart contract, use Foundry:
```bash
forge test
```

This will run the tests in the tests in the `test` directory and return the results.

### Interacting with the Smart Contract

#### Prepare the Environment

In order to use the with the React App the deployed contracts address needs to be added to a .env file.  

Copy the `.example.env` to `yield-farm-frontend/.env` file.  Copy the contract address from the deployment and paste it into the `yield-farm-frontend/.env` file. 

Then run the following commands to install the dependencies and start the React application:
```bash
npm install
```

This will install the necessary dependencies for the React frontend application.

```bash
npm start
```

This will start the React application and open it in the default browser. 

### Connect and fund Metamask account

Connect a MetaMask wallet to the local network when prompted by the application. If there is not a local network setup then add one using the correct chain ID and RPC URL which will have been returned when starting the local chain.

Fund the Metamask account with some test Ether by using the private key from one of the existing account's also returned when starting the local chain by using  the command:
```bash
cast send --value <AMOUNT> --private-key <ANVIL_PRIVATE_KEY> <YOUR_ADDRESS>
```

Make it a lot of ETH because why not. Typically the local blockchain will provide 1000 ETH to accounts that are automatically created.

### The React Web Interface

Use the interface to deposit ETH, view the pool's status, and try to withdraw your investment. Your ETH will be inaccessible for the lock period which is set to 365 days (31536000 seconds). 

### Exploring the Blockchain and Smart Contract

We can get the latest block information which will include the timestamp local testnet blockchain (e.g. Anvil):

```bash
cast block -r http://localhost:8545
```

Copy the timestap and convert it to a human readable format.
```bash
date -d @<TIMESTAMP>
```

We can push the lock period forward on our local test network with the `anvil` command, for this we will need the chain ID (Anvil default is 31337) and the RPC URL (Anvil default is http://localhost:8545).

```bash
curl -X POST --data '{"jsonrpc":"2.0","method":"evm_increaseTime","params":[86400],"id":31337}' http://localhost:8545
```

Now try running the `cast block` and `date` commands again and see if the lock period has been pushed forward by a year.

At this point a withdrawal will result in the return of the  investment and the interest accrued.  Ah if it were only that easy.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.