// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/console.sol";

contract YieldFarm {
    address public owner;
    uint256 public poolAmount;
    uint256 public poolRate;
    uint256 public poolLockDuration;

    struct Deposit {
        uint256 amount;
        uint256 time;
    }

    mapping(address => Deposit) public deposits;

    // Define events
    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event PoolRateChanged(uint256 newRate);
    event PoolLockDurationChanged(uint256 newDuration);

    error PoolLocked(uint256 unlockTime);
    constructor() {
        owner = msg.sender;
        poolAmount = 0;
        poolRate = 10; // 10% annual interest rate
        poolLockDuration = 30 days;
    }

    function deposit() public payable {
        require(msg.value > 0, "Deposit required.");
        poolAmount += msg.value;
        deposits[msg.sender] = Deposit(msg.value, block.timestamp);

        emit Deposited(msg.sender, msg.value);
    }

    function withdraw() public {
        Deposit memory userDeposit = deposits[msg.sender];
        require(userDeposit.amount > 0, "No funds available.");
        if(block.timestamp <= userDeposit.time + poolLockDuration) {
            // Revert with the custom error, providing the unlock time
            revert PoolLocked(userDeposit.time + poolLockDuration);
        }

        uint256 depositDuration = block.timestamp - userDeposit.time;
        uint256 interest = calculateInterest(userDeposit.amount, depositDuration);
        uint256 withdrawalAmount = userDeposit.amount + interest;

        uint256 contractBalance = address(this).balance;
        require(contractBalance >= withdrawalAmount, "Contract does not have enough funds.");
        require(poolAmount >= withdrawalAmount, "Pool does not have enough funds.");

        poolAmount -= withdrawalAmount;
        delete deposits[msg.sender];

        (bool sent, ) = msg.sender.call{value: withdrawalAmount}("");
        require(sent, "Failed to send Ether");

        emit Withdrawn(msg.sender, withdrawalAmount);
    }
    
    // Function to get the user deposit amount and time
    function getUserDeposit(address user) public view returns (uint256, uint256) {
        Deposit memory userDeposit = deposits[user];
        return (userDeposit.amount, userDeposit.time);
    }
    
    function calculateInterest(uint256 amount, uint256 depositDuration) public view returns (uint256) {
        uint256 interestPerYear = amount * poolRate / 100;
        uint256 interestForDuration = (interestPerYear * depositDuration) / 365 days;
        return interestForDuration;
    }
    
    function getPoolAmount() public view returns (uint256) {
        return poolAmount;
    }

    function getPoolRate() public view returns (uint256) {
        return poolRate;
    }

    function getPoolLockDuration() public view returns (uint256) {
        return poolLockDuration;
    }

    function changePoolRate(uint256 newRate) public {
        require(msg.sender == owner, "Only owner function.");
        poolRate = newRate;
        emit PoolRateChanged(newRate);
    }

    function changePoolLockDuration(uint256 newDuration) public {
        require(msg.sender == owner, "Only owner can change pool lock duration.");
        poolLockDuration = newDuration;
        emit PoolLockDurationChanged(newDuration);
    }
}
