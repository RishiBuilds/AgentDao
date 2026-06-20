// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/AgentIdentity.sol";
import "../src/AgentTreasury.sol";
import "../src/AgentGovernor.sol";
import "../src/MockERC20.sol";

// AgentIdentity Tests
contract AgentIdentityTest is Test {
    AgentIdentity public agentIdentity;
    address public agent1 = address(0x1);
    address public agent2 = address(0x2);
    address public nonAdmin = address(0x3);

    function setUp() public {
        agentIdentity = new AgentIdentity();
    }

    function test_MintByAdmin() public {
        uint256 tokenId = agentIdentity.mint(agent1, "Alice", "Marketing");
        assertEq(agentIdentity.ownerOf(tokenId), agent1);
        (string memory name, string memory role, bool active) = agentIdentity.getAgentInfo(tokenId);
        assertEq(name, "Alice");
        assertTrue(active);
    }

    function test_RevertWhen_MintByNonAdmin() public {
        vm.prank(nonAdmin);
        vm.expectRevert();
        agentIdentity.mint(agent1, "Alice", "Marketing");
    }

    function test_DeactivateByAdmin() public {
        uint256 tokenId = agentIdentity.mint(agent1, "Alice", "Marketing");
        agentIdentity.deactivate(tokenId);
        assertFalse(agentIdentity.isActive(tokenId));
    }

    function test_RevertWhen_TransferToken() public {
        uint256 tokenId = agentIdentity.mint(agent1, "Alice", "Marketing");
        vm.prank(agent1);
        vm.expectRevert("AgentIdentity: token is soulbound and cannot be transferred");
        agentIdentity.transferFrom(agent1, agent2, tokenId);
    }
}

// AgentTreasury Tests
contract AgentTreasuryTest is Test {
    AgentTreasury public treasury;
    MockERC20 public token;
    address public governance = address(0x100);
    address public attacker = address(0x200);

    function setUp() public {
        treasury = new AgentTreasury();
        token = new MockERC20("Test", "TEST");
        treasury.setGovernance(governance);
        vm.deal(address(this), 100 ether);
    }

    function test_DepositAndRelease() public {
        (bool success,) = address(treasury).call{value: 10 ether}("");
        assertTrue(success);
        assertEq(treasury.getBalance(), 10 ether);
        
        vm.prank(governance);
        treasury.release(payable(address(0x999)), 5 ether);
        assertEq(treasury.getBalance(), 5 ether);
    }

    function test_RevertWhen_ReleaseByNonGovernance() public {
        (bool success,) = address(treasury).call{value: 10 ether}("");
        assertTrue(success);
        
        vm.prank(attacker);
        vm.expectRevert("AgentTreasury: caller is not governance");
        treasury.release(payable(attacker), 5 ether);
    }
}

// AgentGovernor Tests
contract AgentGovernorTest is Test {
    AgentIdentity public agentIdentity;
    AgentTreasury public treasury;
    AgentGovernor public governor;
    address public agent1 = address(0x1);
    address public agent2 = address(0x2);
    address public agent3 = address(0x3);
    address public nonAgent = address(0x9);

    function setUp() public {
        agentIdentity = new AgentIdentity();
        treasury = new AgentTreasury();
        governor = new AgentGovernor(address(agentIdentity), payable(address(treasury)), 1, 100, 2);
        treasury.setGovernance(address(governor));
        
        agentIdentity.mint(agent1, "Agent1", "Marketing");
        agentIdentity.mint(agent2, "Agent2", "Finance");
        agentIdentity.mint(agent3, "Agent3", "Operations");
        
        vm.deal(address(this), 100 ether);
        (bool success,) = address(treasury).call{value: 50 ether}("");
        require(success);
    }

    function test_ProposeByActiveAgent() public {
        bytes memory data = abi.encodeWithSelector(treasury.release.selector, payable(address(0x999)), 10 ether);
        vm.prank(agent1);
        uint256 proposalId = governor.propose("Release funds", address(treasury), 0, data);
        assertEq(proposalId, 0);
    }

    function test_RevertWhen_ProposeByNonAgent() public {
        bytes memory data = abi.encodeWithSelector(treasury.release.selector, payable(address(0x999)), 10 ether);
        vm.prank(nonAgent);
        vm.expectRevert("AgentGovernor: caller does not have active agent");
        governor.propose("Release funds", address(treasury), 0, data);
    }

    function test_RevertWhen_VoteByDeactivatedAgent() public {
        bytes memory data = abi.encodeWithSelector(treasury.release.selector, payable(address(0x999)), 10 ether);
        vm.prank(agent1);
        uint256 proposalId = governor.propose("Release funds", address(treasury), 0, data);
        
        vm.roll(block.number + 2);
        agentIdentity.deactivate(1);
        
        vm.prank(agent2);
        vm.expectRevert("AgentGovernor: caller does not have active agent");
        governor.castVote(proposalId, true);
    }

    function test_ProposalSucceedsWithQuorum() public {
        bytes memory data = abi.encodeWithSelector(treasury.release.selector, payable(address(0x999)), 10 ether);
        vm.prank(agent1);
        uint256 proposalId = governor.propose("Release funds", address(treasury), 0, data);
        
        vm.roll(block.number + 2);
        vm.prank(agent2);
        governor.castVote(proposalId, true);
        vm.prank(agent3);
        governor.castVote(proposalId, true);
        
        vm.roll(block.number + 101);
        assertEq(uint(governor.state(proposalId)), uint(AgentGovernor.ProposalState.Succeeded));
    }

    function test_ProposalFailsWithoutQuorum() public {
        bytes memory data = abi.encodeWithSelector(treasury.release.selector, payable(address(0x999)), 10 ether);
        vm.prank(agent1);
        uint256 proposalId = governor.propose("Release funds", address(treasury), 0, data);
        
        vm.roll(block.number + 2);
        vm.prank(agent2);
        governor.castVote(proposalId, true);
        
        vm.roll(block.number + 101);
        assertEq(uint(governor.state(proposalId)), uint(AgentGovernor.ProposalState.Defeated));
    }

    function test_ExecuteSuccessfulProposal() public {
        bytes memory data = abi.encodeWithSelector(treasury.release.selector, payable(address(0x999)), 10 ether);
        vm.prank(agent1);
        uint256 proposalId = governor.propose("Release funds", address(treasury), 0, data);
        
        vm.roll(block.number + 2);
        vm.prank(agent2);
        governor.castVote(proposalId, true);
        vm.prank(agent3);
        governor.castVote(proposalId, true);
        
        vm.roll(block.number + 101);
        uint256 balanceBefore = address(0x999).balance;
        governor.execute(proposalId);
        assertEq(address(0x999).balance, balanceBefore + 10 ether);
    }

    function test_RevertWhen_ExecuteDefeatedProposal() public {
        bytes memory data = abi.encodeWithSelector(treasury.release.selector, payable(address(0x999)), 10 ether);
        vm.prank(agent1);
        uint256 proposalId = governor.propose("Release funds", address(treasury), 0, data);
        
        vm.roll(block.number + 2);
        vm.prank(agent2);
        governor.castVote(proposalId, false);
        vm.prank(agent3);
        governor.castVote(proposalId, false);
        
        vm.roll(block.number + 101);
        vm.expectRevert("AgentGovernor: proposal not succeeded");
        governor.execute(proposalId);
    }
}
