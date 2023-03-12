pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/YieldFarm.sol";

contract YieldFarmTest is Test {
    YieldFarm yieldFarm;

    function setUp() public {
        yieldFarm = new YieldFarm();
    }

    function testDeposit() public {
        // Example test for deposit function
        address user = address(this);
        uint256 depositAmount = 1 ether;
        vm.deal(user, depositAmount); // Provide test contract with ETH
        vm.startPrank(user);
        yieldFarm.deposit{value: depositAmount}();
        assertEq(yieldFarm.getPoolAmount(), depositAmount);
        vm.stopPrank();
    }
}
