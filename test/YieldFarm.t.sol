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
        uint256 userDepositAmount = 1 ether;
        
        vm.startPrank(user);

        vm.deal(user, userDepositAmount); // Provide user with ETH
        

        yieldFarm.deposit{value: userDepositAmount}();
        uint256 depositTime = block.timestamp;
        
        // Test getUserDeposit
        (uint256 depositedAmount, uint256 depositedTime) = yieldFarm.getUserDeposit(user);        

        assertEq(depositedAmount, userDepositAmount, "Deposited amount does not match");
 
        // Test getUnlockTime immediately after deposit
        assertEq(depositedTime, depositTime, "Deposit time does not match");

        
        // Validate the pool amount has increased by the correct amount       
        assertEq(yieldFarm.getPoolAmount(), initialAdminDeposit + userDepositAmount);

        vm.stopPrank();
    }
    
    function testInterestAccrual() public {
        uint256 userDepositAmount = 1 ether;
        vm.startPrank(user);
        vm.deal(user, userDepositAmount); // Provide user with ETH for deposit
        yieldFarm.deposit{value: userDepositAmount}();

        console.log(yieldFarm.getPoolAmount(), " :Pool amount");
        // Validate the pool amount has increased by the correct amount
        assertEq(yieldFarm.getPoolAmount(), initialAdminDeposit + userDepositAmount);

        // Simulate time passing: timeTravel days
        uint256 daysElapsed = 31 days;        
        vm.warp(block.timestamp + daysElapsed);
        
        // Calculate the expected principle + interest amount
        uint256 interestPerYear = userDepositAmount * yieldFarm.getPoolRate() / 100;
        uint256 interestForDuration = (interestPerYear * daysElapsed) / 365 days;
        
        console.log(interestForDuration," :Earned interest");
                
        // Calculate the expected total payout
        uint256 totalPayout = userDepositAmount + interestForDuration;
        console.log(totalPayout, " :Expected Total payout");
        
        // User attempts to withdraw, expecting interest on their deposit
        console.log(address(user).balance, " User balance before withdraw");
        yieldFarm.withdraw();        
        console.log(address(user).balance, " User balance after withdraw");
        
        // Check the balance to ensure it has increased by the correct interest amount
        assertEq(address(user).balance, totalPayout);        
        
        console.log(yieldFarm.getPoolAmount(), " :Pool amount" );
        // Ensure the pool amount has decreased by the correct amount
        assertEq(yieldFarm.getPoolAmount(), initialAdminDeposit - interestForDuration);
        
        vm.stopPrank();
    }
    
}
