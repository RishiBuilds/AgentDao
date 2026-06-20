"""Finance Agent - Reviews proposals and makes approval decisions."""

import json
from typing import Dict, Any
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from .models import CampaignProposal, FinanceDecision


FINANCE_SYSTEM_PROMPT = """You are a Finance Agent for a DAO organization.

Your role is to:
- Review marketing campaign proposals carefully
- Assess if requested budgets are reasonable and within treasury limits
- Evaluate risk vs. reward for each proposal
- Make approve/reject decisions with clear reasoning
- Suggest alternative budget amounts if needed

When reviewing a proposal, you must return a structured JSON response with:
{
  "decision": "approve" or "reject",
  "reasoning": "Detailed explanation of your decision",
  "recommended_amount": <number or null>,
  "risk_assessment": "Assessment of risks involved",
  "budget_impact": "How this affects the treasury"
}

Decision criteria:
- APPROVE if: Budget is reasonable (<30% of treasury), clear ROI, low-medium risk
- REJECT if: Budget exceeds safe limits (>50% of treasury), unclear ROI, high risk, vague proposal

Be conservative but fair. The DAO's financial health is your priority.
Always return ONLY valid JSON, no additional text or markdown formatting.
"""


class FinanceAgent:
    """Finance Agent that reviews and approves/rejects proposals."""
    
    def __init__(self, api_key: str, model: str = "llama-3.3-70b-versatile"):
        """Initialize the Finance Agent.
        
        Args:
            api_key: Groq API key
            model: Model to use (default: llama-3.3-70b-versatile)
        """
        self.llm = ChatGroq(
            api_key=api_key,
            model=model,
            temperature=0.3,  # More conservative, less random
        )
        
    def review_proposal(
        self, 
        proposal: CampaignProposal, 
        treasury_budget: float
    ) -> FinanceDecision:
        """Review a campaign proposal and make a decision.
        
        Args:
            proposal: The campaign proposal to review
            treasury_budget: Current treasury budget in MON
            
        Returns:
            FinanceDecision object with structured decision
        """
        proposal_summary = f"""
Campaign: {proposal.campaign_name}
Description: {proposal.description}
Requested Amount: {proposal.requested_amount} MON
Expected ROI: {proposal.expected_roi}
Target Audience: {proposal.target_audience}
Duration: {proposal.duration}

Current Treasury Budget: {treasury_budget} MON
Percentage of Treasury: {(proposal.requested_amount / treasury_budget * 100):.1f}%
"""
        
        messages = [
            SystemMessage(content=FINANCE_SYSTEM_PROMPT),
            HumanMessage(content=f"Review this proposal and make a decision:\n\n{proposal_summary}")
        ]
        
        response = self.llm.invoke(messages)
        
        # Parse the JSON response
        try:
            # Extract JSON from response, handling potential markdown formatting
            content = response.content.strip()
            if content.startswith("```json"):
                content = content.split("```json")[1].split("```")[0].strip()
            elif content.startswith("```"):
                content = content.split("```")[1].split("```")[0].strip()
            
            decision_data = json.loads(content)
            return FinanceDecision(**decision_data)
        except (json.JSONDecodeError, ValueError) as e:
            raise ValueError(f"Failed to parse Finance Agent response: {e}\nResponse: {response.content}")
    
    def get_info(self) -> Dict[str, Any]:
        """Get agent information."""
        return {
            "name": "Finance Agent",
            "role": "Proposal Reviewer & Approver",
            "capabilities": [
                "Review campaign proposals",
                "Assess financial risk",
                "Make approve/reject decisions",
                "Budget impact analysis"
            ]
        }
