pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/YieldFarm.sol";

contract YieldFarmTest is Test {
    YieldFarm public yieldFarm;
    address public admin;
    address public user;
    uint256 public initialContractBalance = 10 ether;
    uint256 public initialAdminDeposit = 5 ether; // Initial deposit by the admin

    function setUp() public {
        yieldFarm = new YieldFarm();
        admin = address(1); // Simulated admin address
        user = address(2); // Simulated regular user address

        // Fund the YieldFarm contract to ensure it can cover interest payments
        address payable contractAddr = payable(address(yieldFarm));
        vm.deal(contractAddr, initialContractBalance);

        // Admin makes an initial deposit to the contract
        vm.startPrank(admin);
        vm.deal(admin, initialAdminDeposit); // Provide admin with ETH
        yieldFarm.deposit{value: initialAdminDeposit}();
        vm.stopPrank();
    }
    
    function testDeployment() public {
        // Example test for contract deployment
        assertEq(yieldFarm.owner(), address(this));
        assertEq(yieldFarm.poolAmount(), initialAdminDeposit);
        assertEq(yieldFarm.poolRate(), 10);
        assertEq(yieldFarm.poolLockDuration(), 30 days);
    }

    function testDeposit() public {
        // Example test for user deposit function
        uint256 userDepositAmount = 1 ether;
        vm.startPrank(user);
        vm.deal(user, userDepositAmount); // Provide user with ETH
        yieldFarm.deposit{value: userDepositAmount}();
        assertEq(yieldFarm.getPoolAmount(), initialAdminDeposit + userDepositAmount);
        vm.stopPrank();
    }
    
    function testInterestAccrual() public {
        uint256 userDepositAmount = 1 ether;
        vm.startPrank(user);
        vm.deal(user, userDepositAmount); // Provide user with ETH for deposit
        yieldFarm.deposit{value: userDepositAmount}();
        
        // Validate the pool amount has increased by the correct amount
        assertEq(yieldFarm.getPoolAmount(), initialAdminDeposit + userDepositAmount);

        // Simulate time passing: 365 days
        vm.warp(block.timestamp + 365 days);


        // Calculate the expected principle + interest amount
        uint256 earnedInterest = userDepositAmount * yieldFarm.getPoolRate() / 100;
        
        // Calculate the expected total payout
        uint256 totalPayout = userDepositAmount + earnedInterest;

        // User attempts to withdraw, expecting interest on their deposit
        yieldFarm.withdraw();        

        // Check the balance to ensure it has increased by the correct interest amount
        assertEq(address(user).balance, totalPayout);        
        // Ensure the pool amount has decreased by the correct amount
        assertEq(yieldFarm.getPoolAmount(), initialAdminDeposit - earnedInterest);
        
        vm.stopPrank();
    }
}
