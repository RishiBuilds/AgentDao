"""Data models for agent communication."""

from typing import Literal
from pydantic import BaseModel, Field


class CampaignProposal(BaseModel):
    """Campaign proposal from Marketing Agent."""
    
    campaign_name: str = Field(description="Name of the marketing campaign")
    description: str = Field(description="Detailed description of the campaign")
    requested_amount: float = Field(description="Requested budget in MON", gt=0)
    expected_roi: str = Field(description="Expected return on investment")
    target_audience: str = Field(description="Target audience for the campaign")
    duration: str = Field(description="Campaign duration")
    

class FinanceDecision(BaseModel):
    """Finance decision from Finance Agent."""
    
    decision: Literal["approve", "reject"] = Field(description="Approval decision")
    reasoning: str = Field(description="Detailed reasoning for the decision")
    recommended_amount: float | None = Field(
        default=None,
        description="Recommended budget if different from requested"
    )
    risk_assessment: str = Field(description="Risk assessment of the proposal")
    budget_impact: str = Field(description="Impact on treasury budget")


class AgentExchange(BaseModel):
    """Complete exchange between agents."""
    
    proposal: CampaignProposal
    finance_decision: FinanceDecision
    treasury_budget: float
    timestamp: str
