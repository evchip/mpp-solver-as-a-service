// SPDX-License-Identifier: MIT
pragma solidity >=0.8.28;

import "forge-std/Script.sol";
import { PolymarketEscrow } from "../src/PolymarketEscrow.sol";

contract Deploy is Script {
    function run() external {
        address usdc = vm.envAddress("USDC_ADDRESS");
        address relayer = vm.envAddress("RELAYER_ADDRESS");

        vm.startBroadcast();
        PolymarketEscrow escrow = new PolymarketEscrow(usdc, relayer);
        vm.stopBroadcast();

        console.log("PolymarketEscrow deployed to:", address(escrow));
    }
}
