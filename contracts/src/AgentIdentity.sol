// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title AgentIdentity
/// @notice Soulbound (non-transferable) ERC-721 representing each AI agent's on-chain identity
/// @dev Each token stores agent name, role, and active/inactive status
contract AgentIdentity is ERC721, Ownable {
    struct AgentInfo {
        string name;
        string role;
        bool isActive;
    }

    // Token ID counter
    uint256 private _nextTokenId;

    // Mapping from token ID to agent info
    mapping(uint256 => AgentInfo) private _agentInfo;

    // Events
    event AgentMinted(uint256 indexed tokenId, address indexed owner, string name, string role);
    event AgentDeactivated(uint256 indexed tokenId);
    event AgentActivated(uint256 indexed tokenId);

    constructor() ERC721("AgentIdentity", "AGENT") Ownable(msg.sender) {}

    /// @notice Mint a new agent identity
    /// @param to Address to receive the agent identity
    /// @param name Name of the agent
    /// @param role Role of the agent (e.g., "Marketing", "Finance")
    function mint(address to, string memory name, string memory role) external onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        
        _agentInfo[tokenId] = AgentInfo({
            name: name,
            role: role,
            isActive: true
        });

        emit AgentMinted(tokenId, to, name, role);
        return tokenId;
    }

    /// @notice Deactivate an agent identity
    /// @param tokenId Token ID to deactivate
    function deactivate(uint256 tokenId) external onlyOwner {
        require(ownerOf(tokenId) != address(0), "AgentIdentity: token does not exist");
        require(_agentInfo[tokenId].isActive, "AgentIdentity: agent already inactive");
        
        _agentInfo[tokenId].isActive = false;
        emit AgentDeactivated(tokenId);
    }

    /// @notice Activate an agent identity
    /// @param tokenId Token ID to activate
    function activate(uint256 tokenId) external onlyOwner {
        require(ownerOf(tokenId) != address(0), "AgentIdentity: token does not exist");
        require(!_agentInfo[tokenId].isActive, "AgentIdentity: agent already active");
        
        _agentInfo[tokenId].isActive = true;
        emit AgentActivated(tokenId);
    }

    /// @notice Check if an agent is active
    /// @param tokenId Token ID to check
    function isActive(uint256 tokenId) external view returns (bool) {
        require(ownerOf(tokenId) != address(0), "AgentIdentity: token does not exist");
        return _agentInfo[tokenId].isActive;
    }

    /// @notice Get agent information
    /// @param tokenId Token ID to query
    function getAgentInfo(uint256 tokenId) external view returns (string memory name, string memory role, bool active) {
        require(ownerOf(tokenId) != address(0), "AgentIdentity: token does not exist");
        AgentInfo memory info = _agentInfo[tokenId];
        return (info.name, info.role, info.isActive);
    }

    /// @notice Check if an address owns an active agent
    /// @param account Address to check
    function hasActiveAgent(address account) external view returns (bool) {
        uint256 balance = balanceOf(account);
        if (balance == 0) return false;
        
        // Check all tokens owned by this address
        for (uint256 i = 0; i < _nextTokenId; i++) {
            try this.ownerOf(i) returns (address owner) {
                if (owner == account && _agentInfo[i].isActive) {
                    return true;
                }
            } catch {
                // Token doesn't exist, continue
                continue;
            }
        }
        return false;
    }

    /// @notice Override transfer functions to make tokens soulbound (non-transferable)
    function _update(address to, uint256 tokenId, address auth)
        internal
        virtual
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        
        // Allow minting (from == address(0)) but prevent transfers
        require(from == address(0), "AgentIdentity: token is soulbound and cannot be transferred");
        
        return super._update(to, tokenId, auth);
    }

    /// @notice Get total number of agents minted
    function totalSupply() external view returns (uint256) {
        return _nextTokenId;
    }
}
