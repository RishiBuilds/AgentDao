"""Client for communicating with the backend API (Phase 3)."""

import httpx
from typing import Dict, Any, List
import time


class BackendClient:
    """Client for interacting with backend blockchain API."""
    
    def __init__(self, base_url: str = "http://localhost:3001"):
        """Initialize the backend client.
        
        Args:
            base_url: Base URL of the backend API
        """
        self.base_url = base_url.rstrip("/")
        self.client = httpx.Client(timeout=30.0)
    
    def health_check(self) -> bool:
        """Check if backend is healthy.
        
        Returns:
            True if backend is up and running
        """
        try:
            response = self.client.get(f"{self.base_url}/health")
            return response.status_code == 200
        except Exception:
            return False
    
    def get_current_block(self) -> int:
        """Get current block number.
        
        Returns:
            Current block number
        """
        response = self.client.get(f"{self.base_url}/api/block")
        response.raise_for_status()
        data = response.json()
        return int(data["data"]["blockNumber"])
    
    def get_agents(self) -> List[Dict[str, Any]]:
        """Get all active agents.
        
        Returns:
            List of agent objects
        """
        response = self.client.get(f"{self.base_url}/api/agents")
        response.raise_for_status()
        data = response.json()
        return data["data"]
    
    def get_treasury_balance(self) -> Dict[str, Any]:
        """Get treasury balance.
        
        Returns:
            Dictionary with balance info
        """
        response = self.client.get(f"{self.base_url}/api/treasury/balance")
        response.raise_for_status()
        data = response.json()
        return data["data"]
    
    def create_proposal(
        self, 
        description: str, 
        target: str, 
        amount: str
    ) -> Dict[str, Any]:
        """Create a new proposal on-chain.
        
        Args:
            description: Proposal description
            target: Target address for funds
            amount: Amount in MON
            
        Returns:
            Dictionary with proposalId and txHash
        """
        payload = {
            "description": description,
            "target": target,
            "amount": amount
        }
        response = self.client.post(
            f"{self.base_url}/api/proposals",
            json=payload
        )
        response.raise_for_status()
        data = response.json()
        return data["data"]
    
    def get_proposal(self, proposal_id: int) -> Dict[str, Any]:
        """Get proposal details.
        
        Args:
            proposal_id: ID of the proposal
            
        Returns:
            Proposal details
        """
        response = self.client.get(f"{self.base_url}/api/proposals/{proposal_id}")
        response.raise_for_status()
        data = response.json()
        return data["data"]
    
    def cast_vote(self, proposal_id: int, support: bool) -> str:
        """Cast a vote on a proposal.
        
        Args:
            proposal_id: ID of the proposal
            support: True for approve, False for reject
            
        Returns:
            Transaction hash
        """
        payload = {"support": support}
        response = self.client.post(
            f"{self.base_url}/api/proposals/{proposal_id}/vote",
            json=payload
        )
        response.raise_for_status()
        data = response.json()
        return data["data"]["txHash"]
    
    def execute_proposal(self, proposal_id: int) -> str:
        """Execute a passed proposal.
        
        Args:
            proposal_id: ID of the proposal
            
        Returns:
            Transaction hash
        """
        response = self.client.post(
            f"{self.base_url}/api/proposals/{proposal_id}/execute"
        )
        response.raise_for_status()
        data = response.json()
        return data["data"]["txHash"]
    
    def wait_for_voting_period(self, proposal_id: int, max_wait: int = 60) -> bool:
        """Wait for proposal to become active (voting delay to pass).
        
        Args:
            proposal_id: ID of the proposal
            max_wait: Maximum seconds to wait
            
        Returns:
            True if proposal became active
        """
        start_time = time.time()
        while time.time() - start_time < max_wait:
            proposal = self.get_proposal(proposal_id)
            if proposal["state"] == "Active":
                return True
            time.sleep(2)
        return False
    
    def wait_for_blocks(self, num_blocks: int = 3):
        """Wait for a certain number of blocks to be mined.
        
        Args:
            num_blocks: Number of blocks to wait for
        """
        current = self.get_current_block()
        target = current + num_blocks
        
        while self.get_current_block() < target:
            time.sleep(2)
    
    def close(self):
        """Close the HTTP client."""
        self.client.close()
