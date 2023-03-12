import React, { useState, useEffect } from 'react';
import YieldFarmABI from './YieldFarm.json';
import { ethers } from 'ethers';

const contractAddress = "0x29D2DAe17003b4D3B5C280A01193D8c8343220d0";

function getContract() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(contractAddress, YieldFarmABI.abi, signer); // Ensure you're using the ABI correctly
  return contract;
}

function App() {
  const [userAccount, setUserAccount] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [poolInfo, setPoolInfo] = useState({ amount: 0, rate: 0, duration: 0 });

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

  async function deposit() {
    if (!depositAmount) return;
    await depositToContract(depositAmount);
    fetchPoolInfo(); // Refresh pool info after deposit
  }

  async function withdraw() {
    await withdrawFromContract();
    fetchPoolInfo(); // Refresh pool info after withdrawal
  }

  async function depositToContract(amount) {
    if (!window.ethereum) return;
    const contract = getContract();
    try {
      const transaction = await contract.deposit({ value: ethers.utils.parseEther(amount) });
      await transaction.wait();
      alert("Deposit successful!");
      setDepositAmount(''); // Reset deposit amount
    } catch (error) {
      console.error("Deposit failed:", error);
    }
  }

  async function withdrawFromContract() {
    if (!window.ethereum) return;
    const contract = getContract();
    try {
      const transaction = await contract.withdraw();
      await transaction.wait();
      alert("Withdraw successful!");
    } catch (error) {
      console.error("Withdraw failed:", error);
    }
  }

  async function fetchPoolInfo() {
    if (!window.ethereum) return;
    const contract = getContract();
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

  // Fetch pool info when the component mounts
  useEffect(() => {
    fetchPoolInfo();
  }, []);

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
