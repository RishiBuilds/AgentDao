"""Marketing Agent - Proposes campaign ideas with budgets."""

import json
from typing import Dict, Any
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from .models import CampaignProposal


MARKETING_SYSTEM_PROMPT = """You are a Marketing Agent for a DAO organization.

Your role is to:
- Propose creative marketing campaigns that can help grow the DAO
- Provide detailed descriptions of campaign strategies
- Request appropriate budgets based on campaign scope
- Estimate expected ROI and define target audiences

When proposing a campaign, you must return a structured JSON response with:
{
  "campaign_name": "Name of the campaign",
  "description": "Detailed description of what the campaign involves",
  "requested_amount": <number in MON, must be positive>,
  "expected_roi": "Expected return on investment description",
  "target_audience": "Who this campaign targets",
  "duration": "How long the campaign will run"
}

Be creative but realistic. Consider the DAO's resources and goals.
Always return ONLY valid JSON, no additional text or markdown formatting.
"""


class MarketingAgent:
    """Marketing Agent that proposes campaign ideas."""
    
    def __init__(self, api_key: str, model: str = "llama-3.3-70b-versatile"):
        """Initialize the Marketing Agent.
        
        Args:
            api_key: Groq API key
            model: Model to use (default: llama-3.3-70b-versatile)
        """
        self.llm = ChatGroq(
            api_key=api_key,
            model=model,
            temperature=0.7,  # Creative but not too random
        )
        
    def propose_campaign(self, scenario: str) -> CampaignProposal:
        """Generate a campaign proposal based on a scenario.
        
        Args:
            scenario: The scenario or prompt for the campaign
            
        Returns:
            CampaignProposal object with structured proposal
        """
        messages = [
            SystemMessage(content=MARKETING_SYSTEM_PROMPT),
            HumanMessage(content=f"Propose a marketing campaign: {scenario}")
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
            
            proposal_data = json.loads(content)
            return CampaignProposal(**proposal_data)
        except (json.JSONDecodeError, ValueError) as e:
            raise ValueError(f"Failed to parse Marketing Agent response: {e}\nResponse: {response.content}")
    
    def get_info(self) -> Dict[str, Any]:
        """Get agent information."""
        return {
            "name": "Marketing Agent",
            "role": "Campaign Proposal Creator",
            "capabilities": [
                "Propose marketing campaigns",
                "Define budgets and ROI",
                "Target audience analysis"
            ]
        }
