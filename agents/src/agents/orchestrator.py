"""Orchestrator for agent interactions."""

import json
from datetime import datetime
from typing import Dict, Any
from .marketing_agent import MarketingAgent
from .finance_agent import FinanceAgent
from .models import AgentExchange


class AgentOrchestrator:
    """Orchestrates interactions between Marketing and Finance agents."""
    
    def __init__(self, api_key: str, treasury_budget: float = 1.0):
        """Initialize the orchestrator.
        
        Args:
            api_key: Groq API key
            treasury_budget: Current treasury budget in MON
        """
        self.marketing_agent = MarketingAgent(api_key=api_key)
        self.finance_agent = FinanceAgent(api_key=api_key)
        self.treasury_budget = treasury_budget
        
    def run_scenario(self, scenario: str, verbose: bool = True) -> AgentExchange:
        """Run a complete scenario: proposal → review → decision.
        
        Args:
            scenario: Description of the campaign scenario
            verbose: Whether to print detailed logs
            
        Returns:
            AgentExchange object with complete interaction
        """
        if verbose:
            print(f"\n{'='*80}")
            print(f"SCENARIO: {scenario}")
            print(f"{'='*80}\n")
        
        # Step 1: Marketing Agent proposes campaign
        if verbose:
            print("📢 Marketing Agent: Generating proposal...")
        
        proposal = self.marketing_agent.propose_campaign(scenario)
        
        if verbose:
            print(f"\n✅ Proposal Generated:")
            print(f"   Campaign: {proposal.campaign_name}")
            print(f"   Requested: {proposal.requested_amount} MON")
            print(f"   Description: {proposal.description}")
            print(f"   ROI: {proposal.expected_roi}")
            print(f"   Target: {proposal.target_audience}")
            print(f"   Duration: {proposal.duration}")
        
        # Step 2: Finance Agent reviews proposal
        if verbose:
            print(f"\n💼 Finance Agent: Reviewing proposal...")
            print(f"   Treasury Budget: {self.treasury_budget} MON")
            print(f"   % of Budget: {(proposal.requested_amount / self.treasury_budget * 100):.1f}%")
        
        decision = self.finance_agent.review_proposal(proposal, self.treasury_budget)
        
        if verbose:
            print(f"\n{'🟢 APPROVED' if decision.decision == 'approve' else '🔴 REJECTED'}")
            print(f"   Decision: {decision.decision.upper()}")
            print(f"   Reasoning: {decision.reasoning}")
            print(f"   Risk: {decision.risk_assessment}")
            print(f"   Budget Impact: {decision.budget_impact}")
            if decision.recommended_amount:
                print(f"   Recommended: {decision.recommended_amount} MON")
        
        # Create exchange record
        exchange = AgentExchange(
            proposal=proposal,
            finance_decision=decision,
            treasury_budget=self.treasury_budget,
            timestamp=datetime.now().isoformat()
        )
        
        if verbose:
            print(f"\n{'='*80}\n")
        
        return exchange
    
    def run_multiple_scenarios(self, scenarios: list[str]) -> list[AgentExchange]:
        """Run multiple scenarios and return all exchanges.
        
        Args:
            scenarios: List of scenario descriptions
            
        Returns:
            List of AgentExchange objects
        """
        exchanges = []
        
        for i, scenario in enumerate(scenarios, 1):
            print(f"\n🔹 Running Scenario {i}/{len(scenarios)}")
            exchange = self.run_scenario(scenario, verbose=True)
            exchanges.append(exchange)
        
        return exchanges
    
    def get_summary(self, exchanges: list[AgentExchange]) -> Dict[str, Any]:
        """Generate summary statistics from multiple exchanges.
        
        Args:
            exchanges: List of AgentExchange objects
            
        Returns:
            Summary statistics
        """
        total = len(exchanges)
        approved = sum(1 for ex in exchanges if ex.finance_decision.decision == "approve")
        rejected = total - approved
        
        total_requested = sum(ex.proposal.requested_amount for ex in exchanges)
        approved_amount = sum(
            ex.proposal.requested_amount 
            for ex in exchanges 
            if ex.finance_decision.decision == "approve"
        )
        
        return {
            "total_scenarios": total,
            "approved": approved,
            "rejected": rejected,
            "approval_rate": f"{(approved / total * 100):.1f}%",
            "total_requested": f"{total_requested:.2f} MON",
            "approved_amount": f"{approved_amount:.2f} MON",
            "treasury_budget": f"{self.treasury_budget} MON"
        }
