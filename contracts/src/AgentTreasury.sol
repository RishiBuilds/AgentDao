// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title AgentTreasury
/// @notice Holds DAO funds and releases them only via authorized governance calls
/// @dev Funds can only be released after a successful governance vote
contract AgentTreasury is Ownable {
    using SafeERC20 for IERC20;

    // Address of the governance contract authorized to release funds
    address public governance;

    // Events
    event Deposited(address indexed from, uint256 amount);
    event DepositedERC20(address indexed token, address indexed from, uint256 amount);
    event Released(address indexed to, uint256 amount);
    event ReleasedERC20(address indexed token, address indexed to, uint256 amount);
    event GovernanceUpdated(address indexed oldGovernance, address indexed newGovernance);

    modifier onlyGovernance() {
        require(msg.sender == governance, "AgentTreasury: caller is not governance");
        _;
    }

    constructor() Ownable(msg.sender) {}

    /// @notice Set the governance contract address
    /// @param _governance Address of the governance contract
    function setGovernance(address _governance) external onlyOwner {
        require(_governance != address(0), "AgentTreasury: governance is zero address");
        address oldGovernance = governance;
        governance = _governance;
        emit GovernanceUpdated(oldGovernance, _governance);
    }

    /// @notice Deposit native tokens (MON) to the treasury
    receive() external payable {
        emit Deposited(msg.sender, msg.value);
    }

    /// @notice Deposit ERC20 tokens to the treasury
    /// @param token ERC20 token address
    /// @param amount Amount to deposit
    function depositERC20(address token, uint256 amount) external {
        require(token != address(0), "AgentTreasury: token is zero address");
        require(amount > 0, "AgentTreasury: amount is zero");
        
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        emit DepositedERC20(token, msg.sender, amount);
    }

    /// @notice Release native tokens from treasury (only callable by governance)
    /// @param to Recipient address
    /// @param amount Amount to release
    function release(address payable to, uint256 amount) external onlyGovernance {
        require(to != address(0), "AgentTreasury: recipient is zero address");
        require(amount > 0, "AgentTreasury: amount is zero");
        require(address(this).balance >= amount, "AgentTreasury: insufficient balance");
        
        (bool success, ) = to.call{value: amount}("");
        require(success, "AgentTreasury: transfer failed");
        
        emit Released(to, amount);
    }

    /// @notice Release ERC20 tokens from treasury (only callable by governance)
    /// @param token ERC20 token address
    /// @param to Recipient address
    /// @param amount Amount to release
    function releaseERC20(address token, address to, uint256 amount) external onlyGovernance {
        require(token != address(0), "AgentTreasury: token is zero address");
        require(to != address(0), "AgentTreasury: recipient is zero address");
        require(amount > 0, "AgentTreasury: amount is zero");
        
        IERC20(token).safeTransfer(to, amount);
        emit ReleasedERC20(token, to, amount);
    }

    /// @notice Get native token balance
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /// @notice Get ERC20 token balance
    /// @param token ERC20 token address
    function getERC20Balance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }
}
