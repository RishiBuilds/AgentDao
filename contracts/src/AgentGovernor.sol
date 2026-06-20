// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./AgentIdentity.sol";
import "./AgentTreasury.sol";

/// @title AgentGovernor
/// @notice Voting contract where each active agent has 1 vote (not token-weighted)
/// @dev Based on governance patterns but adapted for agent-based voting
contract AgentGovernor {
    enum ProposalState {
        Pending,
        Active,
        Defeated,
        Succeeded,
        Executed
    }

    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        address target;
        uint256 value;
        bytes data;
        uint256 startBlock;
        uint256 endBlock;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
        mapping(address => bool) hasVoted;
    }

    // State variables
    AgentIdentity public agentIdentity;
    AgentTreasury public treasury;
    
    uint256 public votingDelay; // Blocks before voting starts
    uint256 public votingPeriod; // Blocks for voting duration
    uint256 public quorum; // Minimum number of votes needed
    
    uint256 private _proposalCount;
    mapping(uint256 => Proposal) public proposals;

    // Events
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string description,
        uint256 startBlock,
        uint256 endBlock
    );
    event VoteCast(address indexed voter, uint256 indexed proposalId, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId);

    modifier onlyActiveAgent() {
        require(agentIdentity.hasActiveAgent(msg.sender), "AgentGovernor: caller does not have active agent");
        _;
    }

    constructor(
        address _agentIdentity,
        address payable _treasury,
        uint256 _votingDelay,
        uint256 _votingPeriod,
        uint256 _quorum
    ) {
        require(_agentIdentity != address(0), "AgentGovernor: agentIdentity is zero address");
        require(_treasury != address(0), "AgentGovernor: treasury is zero address");
        require(_votingPeriod > 0, "AgentGovernor: voting period must be greater than 0");
        require(_quorum > 0, "AgentGovernor: quorum must be greater than 0");

        agentIdentity = AgentIdentity(_agentIdentity);
        treasury = AgentTreasury(_treasury);
        votingDelay = _votingDelay;
        votingPeriod = _votingPeriod;
        quorum = _quorum;
    }

    /// @notice Create a new proposal
    /// @param description Human-readable description
    /// @param target Contract address to call
    /// @param value ETH value to send
    /// @param data Calldata for the target contract
    function propose(
        string memory description,
        address target,
        uint256 value,
        bytes memory data
    ) external onlyActiveAgent returns (uint256) {
        uint256 proposalId = _proposalCount++;
        Proposal storage proposal = proposals[proposalId];
        
        proposal.id = proposalId;
        proposal.proposer = msg.sender;
        proposal.description = description;
        proposal.target = target;
        proposal.value = value;
        proposal.data = data;
        proposal.startBlock = block.number + votingDelay;
        proposal.endBlock = proposal.startBlock + votingPeriod;
        proposal.executed = false;

        emit ProposalCreated(
            proposalId,
            msg.sender,
            description,
            proposal.startBlock,
            proposal.endBlock
        );

        return proposalId;
    }

    /// @notice Cast a vote on a proposal
    /// @param proposalId ID of the proposal
    /// @param support True for yes, false for no
    function castVote(uint256 proposalId, bool support) external onlyActiveAgent {
        require(proposalId < _proposalCount, "AgentGovernor: invalid proposal id");
        Proposal storage proposal = proposals[proposalId];
        
        require(block.number >= proposal.startBlock, "AgentGovernor: voting not started");
        require(block.number <= proposal.endBlock, "AgentGovernor: voting ended");
        require(!proposal.hasVoted[msg.sender], "AgentGovernor: already voted");
        require(!proposal.executed, "AgentGovernor: proposal already executed");

        proposal.hasVoted[msg.sender] = true;
        
        // Each active agent gets 1 vote
        if (support) {
            proposal.forVotes += 1;
        } else {
            proposal.againstVotes += 1;
        }

        emit VoteCast(msg.sender, proposalId, support, 1);
    }

    /// @notice Execute a successful proposal
    /// @param proposalId ID of the proposal
    function execute(uint256 proposalId) external {
        require(proposalId < _proposalCount, "AgentGovernor: invalid proposal id");
        Proposal storage proposal = proposals[proposalId];
        
        ProposalState currentState = state(proposalId);
        require(currentState == ProposalState.Succeeded, "AgentGovernor: proposal not succeeded");
        require(!proposal.executed, "AgentGovernor: proposal already executed");

        proposal.executed = true;

        // Execute the proposal
        (bool success, ) = proposal.target.call{value: proposal.value}(proposal.data);
        require(success, "AgentGovernor: execution failed");

        emit ProposalExecuted(proposalId);
    }

    /// @notice Get the state of a proposal
    /// @param proposalId ID of the proposal
    function state(uint256 proposalId) public view returns (ProposalState) {
        require(proposalId < _proposalCount, "AgentGovernor: invalid proposal id");
        Proposal storage proposal = proposals[proposalId];

        if (proposal.executed) {
            return ProposalState.Executed;
        }

        if (block.number < proposal.startBlock) {
            return ProposalState.Pending;
        }

        if (block.number <= proposal.endBlock) {
            return ProposalState.Active;
        }

        // Voting has ended, check if it succeeded
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes;
        
        if (totalVotes < quorum || proposal.forVotes <= proposal.againstVotes) {
            return ProposalState.Defeated;
        }

        return ProposalState.Succeeded;
    }

    /// @notice Get proposal details
    function getProposal(uint256 proposalId) external view returns (
        address proposer,
        string memory description,
        address target,
        uint256 value,
        uint256 startBlock,
        uint256 endBlock,
        uint256 forVotes,
        uint256 againstVotes,
        bool executed
    ) {
        require(proposalId < _proposalCount, "AgentGovernor: invalid proposal id");
        Proposal storage proposal = proposals[proposalId];
        
        return (
            proposal.proposer,
            proposal.description,
            proposal.target,
            proposal.value,
            proposal.startBlock,
            proposal.endBlock,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.executed
        );
    }

    /// @notice Check if an address has voted on a proposal
    function hasVoted(uint256 proposalId, address voter) external view returns (bool) {
        require(proposalId < _proposalCount, "AgentGovernor: invalid proposal id");
        return proposals[proposalId].hasVoted[voter];
    }

    /// @notice Get total number of proposals
    function proposalCount() external view returns (uint256) {
        return _proposalCount;
    }
}
