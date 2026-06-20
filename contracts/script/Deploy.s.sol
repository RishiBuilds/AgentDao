// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/AgentIdentity.sol";
import "../src/AgentTreasury.sol";
import "../src/AgentGovernor.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);

        // Deploy AgentIdentity
        AgentIdentity agentIdentity = new AgentIdentity();
        console.log("AgentIdentity deployed at:", address(agentIdentity));

        // Deploy AgentTreasury
        AgentTreasury treasury = new AgentTreasury();
        console.log("AgentTreasury deployed at:", address(treasury));

        // Deploy AgentGovernor
        // Params: agentIdentity, treasury, votingDelay (1 block), votingPeriod (100 blocks), quorum (2 votes)
        AgentGovernor governor = new AgentGovernor(
            address(agentIdentity),
            payable(address(treasury)),
            1, // votingDelay
            100, // votingPeriod
            2  // quorum
        );
        console.log("AgentGovernor deployed at:", address(governor));

        // Set governor as governance in treasury
        treasury.setGovernance(address(governor));
        console.log("Treasury governance set to Governor");

        vm.stopBroadcast();

        // Output deployment info
        console.log("\n=== Deployment Complete ===");
        console.log("AgentIdentity:", address(agentIdentity));
        console.log("AgentTreasury:", address(treasury));
        console.log("AgentGovernor:", address(governor));
    }
}
