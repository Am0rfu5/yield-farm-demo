import React, { useState, useEffect } from 'react';
import YieldFarmABI from './assets/contracts/YieldFarm.json';
import { ethers } from 'ethers';
import { format} from 'date-fns';
import './App.css';

function getContract() {
  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
  console.log("contractAddress", contractAddress);
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const contract = new ethers.Contract(contractAddress, YieldFarmABI.abi, signer);
  
  console.log("Contract Address:", contractAddress);
  console.log("ABI:", YieldFarmABI.abi);
  console.log("Ethereum Provider:", window.ethereum);
  
  return contract;
}

function App() {
  const [userAccount, setUserAccount] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [poolInfo, setPoolInfo] = useState({ amount: 0, rate: 0, duration: 0 });
  const [unlockDate, setUnlockDate] = useState(0);
  const [currentDeposit, setCurrentDeposit] = useState(null);

  // Function to request account access
  async function connectWallet() {
    if (window.ethereum) { // Check if MetaMask is installed
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }); // Request accounts
        setUserAccount(accounts[0]); // Set the first account as the user account
      } catch (error) {
        console.error("Error connecting to MetaMask", error);
      }
    } else {
      alert("MetaMask is not installed. Please consider installing it: https://metamask.io/download.html");
    }
  }
  
  // Fetch pool info
  async function fetchPoolInfo() {
    if (!window.ethereum) return;
    const contract = getContract();
    console.log("contract", contract);
    try {
      const poolAmount = await contract.getPoolAmount();
      const poolRate = await contract.getPoolRate();
      const poolLockDuration = await contract.getPoolLockDuration();
      setPoolInfo({
        amount: ethers.utils.formatEther(poolAmount),
        rate: poolRate.toString(),
        duration: poolLockDuration.toString()
      });
    } catch (error) {
      console.error("Failed to fetch pool info:", error);
    }
  }

  async function deposit() {
    if (!depositAmount) return;
    await depositToContract(depositAmount);
    fetchPoolInfo(); // Refresh pool info after deposit
  }

  async function depositToContract(amount) {
    if (!window.ethereum || !amount) return;
    const contract = getContract();
    try {
        const tx = await contract.deposit({ value: ethers.utils.parseEther(amount) });
        tx.wait().then((receipt) => {
            console.log("Deposit transaction was successful", receipt);
            alert("Deposit successful!");
            // Refresh pool info after deposit
            fetchPoolInfo();
        }).catch((error) => {
            console.error("Error waiting for deposit transaction", error);
            handleTransactionError(error);
        });
    } catch (error) {
        console.error("Deposit transaction failed to send", error);
        
        handleTransactionError(error);
    }
  }

  async function withdraw() {
    await withdrawFromContract();
    fetchPoolInfo(); // Refresh pool info after withdrawal
  }

  async function withdrawFromContract() {
    if (!window.ethereum) return;
    const contract = getContract();
    try {
        const txResponse = await contract.withdraw();
        await txResponse.wait();
        alert("Withdraw successful!");
    } catch (error) {
        // Use error handling function to interpret the error
        handleTransactionError(error);
    }
  }

  function handleTransactionError(error) {
    console.error("Transaction Error:", error);

    // Generic message for all failed transactions
    let message = "Transaction failed. Please try again.";

    // Specific handling based on known errors or conditions
    if (error.code === ethers.errors.UNPREDICTABLE_GAS_LIMIT) {
        // This may hint at a revert without a specific reason provided to ethers.js
        // You can add context-specific messages here if you know the likely causes of failure
        message = "Transaction failed. It's possible that the pool is still locked.";
    }

    alert(message);
  }

  async function fetchUserDeposit() {
    if (!window.ethereum || !userAccount) return;
    const contract = getContract();
    try {
      const [amount, depositTime] = await contract.getUserDeposit(userAccount);
      const amountInEther = ethers.utils.formatEther(amount);
      setCurrentDeposit(amountInEther);
  
      if (amount.eq(0)) {
        console.log("No deposit found for user");
        setUnlockDate(null);
        return;
      }
  
      const unlockTimeInSeconds = Number(depositTime) + Number(poolInfo.duration);
      const currentTimeInSeconds = Math.floor(Date.now() / 1000);
      if (unlockTimeInSeconds <= currentTimeInSeconds) {
        console.log("Funds are already available");
        setUnlockDate(null);
      } else {
        const unlockDate = new Date(unlockTimeInSeconds * 1000); // Convert to milliseconds
        const formattedUnlockDate = format(unlockDate, "PPPppp");
        console.log(`Funds will be available on: ${formattedUnlockDate}`);
        setUnlockDate(formattedUnlockDate);
      }
    } catch (error) {
      console.error("Failed to fetch user deposit details:", error);
    }
  }
  

  // Update useEffect to fetch user's deposit details
  useEffect(() => {
    async function fetchUserDeposit() {
      if (!window.ethereum || !userAccount) return;
      const contract = getContract();
      try {
        const [amount, depositTime] = await contract.getUserDeposit(userAccount);
        const amountInEther = ethers.utils.formatEther(amount);
        setCurrentDeposit(amountInEther);
    
        if (amount.eq(0)) {
          console.log("No deposit found for user");
          setUnlockDate(null);
          return;
        }
    
        const unlockTimeInSeconds = Number(depositTime) + Number(poolInfo.duration);
        const currentTimeInSeconds = Math.floor(Date.now() / 1000);
        if (unlockTimeInSeconds <= currentTimeInSeconds) {
          console.log("Funds are already available");
          setUnlockDate(null);
        } else {
          const unlockDate = new Date(unlockTimeInSeconds * 1000); // Convert to milliseconds
          const formattedUnlockDate = format(unlockDate, "PPPppp");
          console.log(`Funds will be available on: ${formattedUnlockDate}`);
          setUnlockDate(formattedUnlockDate);
        }
      } catch (error) {
        console.error("Failed to fetch user deposit details:", error);
      }
    }
    
    fetchPoolInfo();
    if (userAccount) {
      fetchUserDeposit();
    }
  }, [userAccount]);
  
  return (
    <div className="App">
      <header className="App-header">
        {userAccount ? (
          <>
            <p>Connected Wallet: {userAccount}</p>
            <input
              type="text"
              placeholder="Amount to deposit (ETH)"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
            />
            <button onClick={deposit}>Deposit</button>
            <button onClick={withdraw}>Withdraw</button>
            <div>
              <p>Pool Amount: {poolInfo.amount} ETH</p>
              <p>Pool Rate: {poolInfo.rate}%</p>
              <p>Lock Duration: {poolInfo.duration} seconds</p>
              <p>Your current deposit: {currentDeposit} ETH</p>
              {currentDeposit > 0 && unlockDate ? (
                  <p>Funds will be available on: {unlockDate}</p>
              ) : (
                  <p>No current deposit or pool is unlocked.</p>
              )}
            </div>
          </>
        ) : (
          <button onClick={connectWallet}>Connect Wallet</button>
        )}
      </header>
    </div>
  );
}

export default App;
