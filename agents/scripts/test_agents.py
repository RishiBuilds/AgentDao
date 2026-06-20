"""Test script for AI agents (offline, no blockchain)."""

import os
import json
from dotenv import load_dotenv
from src.agents.orchestrator import AgentOrchestrator

load_dotenv()


def main():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key or api_key == "your_groq_api_key_here":
        print("ERROR: Set GROQ_API_KEY in agents/.env")
        print("Get a free API key at: https://console.groq.com/keys")
        return

    treasury_budget = float(os.getenv("TREASURY_BUDGET", "1.0"))

    print("Starting AI Agent Tests")
    print(f"Treasury Budget: {treasury_budget} MON\n")

    orchestrator = AgentOrchestrator(api_key=api_key, treasury_budget=treasury_budget)

    scenarios = [
        "Create a social media campaign targeting crypto enthusiasts. "
        "Budget should be modest, around 0.15 MON for Twitter ads and content creation. "
        "Focus on building community engagement over 2 weeks.",
        "Launch a massive multi-platform advertising campaign across all major social networks, "
        "TV commercials, billboards, and influencer partnerships. "
        "We need 0.8 MON for this comprehensive 3-month campaign to dominate the market.",
        "Run a pilot marketing experiment testing new AI-powered ad targeting. "
        "Request 0.35 MON for a 4-week trial with uncertain ROI but high learning potential. "
        "This could revolutionize our approach or fail completely.",
    ]

    exchanges = orchestrator.run_multiple_scenarios(scenarios)

    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80 + "\n")

    summary = orchestrator.get_summary(exchanges)
    for key, value in summary.items():
        print(f"  {key.replace('_', ' ').title()}: {value}")

    results = {
        "summary": summary,
        "exchanges": [
            {
                "scenario_num": i + 1,
                "proposal": {
                    "campaign_name": ex.proposal.campaign_name,
                    "description": ex.proposal.description,
                    "requested_amount": ex.proposal.requested_amount,
                    "expected_roi": ex.proposal.expected_roi,
                    "target_audience": ex.proposal.target_audience,
                    "duration": ex.proposal.duration,
                },
                "decision": {
                    "decision": ex.finance_decision.decision,
                    "reasoning": ex.finance_decision.reasoning,
                    "recommended_amount": ex.finance_decision.recommended_amount,
                    "risk_assessment": ex.finance_decision.risk_assessment,
                    "budget_impact": ex.finance_decision.budget_impact,
                },
                "treasury_budget": ex.treasury_budget,
                "timestamp": ex.timestamp,
            }
            for i, ex in enumerate(exchanges)
        ],
    }

    output_file = "test_results.json"
    with open(output_file, "w") as f:
        json.dump(results, f, indent=2)

    print(f"\nResults saved to {output_file}")
    print(f"Scenarios completed: {len(exchanges)}")


if __name__ == "__main__":
    main()
