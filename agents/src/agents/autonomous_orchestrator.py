"""Autonomous orchestrator connecting AI agents to blockchain."""

import json
import time
from datetime import datetime
from typing import Dict, Any, List
from pathlib import Path

from .marketing_agent import MarketingAgent
from .finance_agent import FinanceAgent
from .models import CampaignProposal, FinanceDecision
from ..chain.backend_client import BackendClient


class AutonomousOrchestrator:
    """Orchestrates the full autonomous loop: AI reasoning → blockchain execution."""
    
    def __init__(
        self, 
        api_key: str,
        backend_url: str = "http://localhost:3001",
        target_address: str = "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
        log_dir: str = "run_logs"
    ):
        """Initialize the autonomous orchestrator.
        
        Args:
            api_key: Groq API key for LLM
            backend_url: Backend API URL
            target_address: Default target address for fund releases
            log_dir: Directory to save run logs
        """
        self.marketing_agent = MarketingAgent(api_key=api_key)
        self.finance_agent = FinanceAgent(api_key=api_key)
        self.backend = BackendClient(base_url=backend_url)
        self.target_address = target_address
        
        # Create log directory
        self.log_dir = Path(log_dir)
        self.log_dir.mkdir(exist_ok=True)
        
    def run_autonomous_loop(
        self, 
        scenario: str,
        run_id: str = None
    ) -> Dict[str, Any]:
        """Run the complete autonomous loop from proposal to execution.
        
        Flow:
        1. Marketing Agent proposes campaign
        2. Finance Agent reviews proposal
        3. Submit proposal on-chain
        4. Finance Agent votes on-chain
        5. Wait for quorum/majority
        6. Execute if passed
        7. Verify treasury updated
        
        Args:
            scenario: Campaign scenario for Marketing Agent
            run_id: Optional run identifier
            
        Returns:
            Complete run log with all steps
        """
        if run_id is None:
            run_id = f"run_{int(time.time())}"
        
        print(f"\n{'='*80}")
        print(f"🚀 AUTONOMOUS LOOP: {run_id}")
        print(f"{'='*80}\n")
        
        # Initialize run log
        run_log = {
            "run_id": run_id,
            "scenario": scenario,
            "timestamp_start": datetime.now().isoformat(),
            "steps": [],
            "transactions": {},
            "final_state": {}
        }
        
        try:
            # Check backend health
            print("🔍 Step 0: Checking backend connection...")
            if not self.backend.health_check():
                raise Exception("Backend is not responding. Make sure it's running on port 3001")
            print("✅ Backend is healthy\n")
            
            # Get initial state
            print("📊 Step 1: Getting initial blockchain state...")
            initial_balance = self.backend.get_treasury_balance()
            agents = self.backend.get_agents()
            current_block = self.backend.get_current_block()
            
            run_log["initial_state"] = {
                "treasury_balance": initial_balance["balance"],
                "treasury_balance_wei": initial_balance["balanceWei"],
                "active_agents": len(agents),
                "current_block": current_block
            }
            
            print(f"   Treasury Balance: {initial_balance['balance']} MON")
            print(f"   Active Agents: {len(agents)}")
            print(f"   Current Block: {current_block}\n")
            
            # Step 1: Marketing Agent proposes
            print("📢 Step 2: Marketing Agent generating proposal...")
            proposal = self.marketing_agent.propose_campaign(scenario)
            
            run_log["steps"].append({
                "step": "marketing_proposal",
                "timestamp": datetime.now().isoformat(),
                "proposal": {
                    "campaign_name": proposal.campaign_name,
                    "description": proposal.description,
                    "requested_amount": proposal.requested_amount,
                    "expected_roi": proposal.expected_roi,
                    "target_audience": proposal.target_audience,
                    "duration": proposal.duration
                }
            })
            
            print(f"✅ Proposal: {proposal.campaign_name}")
            print(f"   Amount: {proposal.requested_amount} MON")
            print(f"   Description: {proposal.description[:100]}...\n")
            
            # Step 2: Finance Agent reviews (off-chain reasoning)
            print("💼 Step 3: Finance Agent reviewing proposal...")
            treasury_budget = float(initial_balance["balance"])
            finance_decision = self.finance_agent.review_proposal(proposal, treasury_budget)
            
            run_log["steps"].append({
                "step": "finance_review",
                "timestamp": datetime.now().isoformat(),
                "decision": {
                    "decision": finance_decision.decision,
                    "reasoning": finance_decision.reasoning,
                    "recommended_amount": finance_decision.recommended_amount,
                    "risk_assessment": finance_decision.risk_assessment,
                    "budget_impact": finance_decision.budget_impact
                }
            })
            
            print(f"{'✅ APPROVED' if finance_decision.decision == 'approve' else '❌ REJECTED'}")
            print(f"   Reasoning: {finance_decision.reasoning[:100]}...")
            print(f"   Risk: {finance_decision.risk_assessment}\n")
            
            # Step 3: Submit proposal on-chain
            print("⛓️  Step 4: Submitting proposal on-chain...")
            proposal_result = self.backend.create_proposal(
                description=f"{proposal.campaign_name}: {proposal.description}",
                target=self.target_address,
                amount=str(proposal.requested_amount)
            )
            
            proposal_id = int(proposal_result["proposalId"])
            create_tx = proposal_result["txHash"]
            
            run_log["transactions"]["proposal_creation"] = create_tx
            run_log["proposal_id"] = proposal_id
            
            print(f"✅ Proposal created on-chain")
            print(f"   Proposal ID: {proposal_id}")
            print(f"   TX: {create_tx}\n")
            
            # Step 4: Wait for voting period to start
            print("⏳ Step 5: Waiting for voting delay...")
            if not self.backend.wait_for_blocks(3, max_wait=60):
                raise Exception("Timed out waiting for additional blocks to be mined")
            
            if not self.backend.wait_for_voting_period(proposal_id, max_wait=60):
                raise Exception("Proposal did not become active in time")
            
            proposal_state = self.backend.get_proposal(proposal_id)
            print(f"✅ Proposal is now ACTIVE")
            print(f"   Voting period: Block {proposal_state['startBlock']} to {proposal_state['endBlock']}\n")
            
            # Step 5: Finance Agent votes on-chain
            print("🗳️  Step 6: Finance Agent casting vote on-chain...")
            vote_support = finance_decision.decision == "approve"
            vote_tx = self.backend.cast_vote(proposal_id, vote_support)
            
            run_log["transactions"]["vote_finance"] = vote_tx
            run_log["steps"].append({
                "step": "on_chain_vote_finance",
                "timestamp": datetime.now().isoformat(),
                "agent": "Finance Agent",
                "vote": "FOR" if vote_support else "AGAINST",
                "tx_hash": vote_tx
            })
            
            print(f"✅ Finance Agent voted: {'FOR' if vote_support else 'AGAINST'}")
            print(f"   TX: {vote_tx}\n")
            
            # Wait for vote to be processed
            time.sleep(3)
            
            # Step 6: Check if we can execute
            print("📊 Step 7: Checking proposal status...")
            proposal_state = self.backend.get_proposal(proposal_id)
            
            run_log["steps"].append({
                "step": "proposal_state_check",
                "timestamp": datetime.now().isoformat(),
                "state": proposal_state["state"],
                "for_votes": proposal_state["forVotes"],
                "against_votes": proposal_state["againstVotes"]
            })
            
            print(f"   State: {proposal_state['state']}")
            print(f"   For: {proposal_state['forVotes']}, Against: {proposal_state['againstVotes']}\n")
            
            # Step 7: Execute if succeeded
            if proposal_state["state"] == "Succeeded" or (
                proposal_state["state"] == "Active" and 
                int(proposal_state["forVotes"]) >= 2
            ):
                print("⚡ Step 8: Executing proposal...")
                try:
                    # Wait a bit more for voting period to end if still active
                    if proposal_state["state"] == "Active":
                        print("   Waiting for voting period to end...")
                        time.sleep(5)
                    
                    execute_tx = self.backend.execute_proposal(proposal_id)
                    run_log["transactions"]["execution"] = execute_tx
                    
                    print(f"✅ Proposal executed!")
                    print(f"   TX: {execute_tx}\n")
                    
                    # Check final treasury balance
                    time.sleep(3)
                    final_balance = self.backend.get_treasury_balance()
                    
                    run_log["final_state"]["executed"] = True
                    run_log["final_state"]["treasury_balance"] = final_balance["balance"]
                    run_log["final_state"]["treasury_balance_wei"] = final_balance["balanceWei"]
                    run_log["final_state"]["funds_released"] = str(
                        float(initial_balance["balance"]) - float(final_balance["balance"])
                    )
                    
                    print(f"💰 Final Treasury: {final_balance['balance']} MON")
                    print(f"   Funds Released: {run_log['final_state']['funds_released']} MON\n")
                    
                except Exception as e:
                    print(f"⚠️  Execution failed: {e}")
                    run_log["final_state"]["executed"] = False
                    run_log["final_state"]["execution_error"] = str(e)
                    run_log["final_state"]["treasury_balance"] = initial_balance["balance"]
                    
            else:
                print("❌ Proposal did not pass (rejected or insufficient votes)")
                run_log["final_state"]["executed"] = False
                run_log["final_state"]["reason"] = "Proposal rejected or quorum not met"
                run_log["final_state"]["treasury_balance"] = initial_balance["balance"]
                print(f"   Final State: {proposal_state['state']}\n")
            
            run_log["timestamp_end"] = datetime.now().isoformat()
            run_log["status"] = "success"
            
        except Exception as e:
            print(f"\n❌ ERROR: {e}\n")
            run_log["status"] = "error"
            run_log["error"] = str(e)
            run_log["timestamp_end"] = datetime.now().isoformat()
        
        # Save log to file
        log_file = self.log_dir / f"{run_id}.json"
        with open(log_file, "w") as f:
            json.dump(run_log, f, indent=2)
        
        print(f"📝 Run log saved to: {log_file}")
        print(f"\n{'='*80}\n")
        
        return run_log
    
    def run_multiple_scenarios(self, scenarios: List[str]) -> List[Dict[str, Any]]:
        """Run multiple autonomous loops with different scenarios.
        
        Args:
            scenarios: List of campaign scenarios
            
        Returns:
            List of run logs
        """
        logs = []
        
        for i, scenario in enumerate(scenarios, 1):
            run_id = f"scenario_{i}_{int(time.time())}"
            print(f"\n🔹 Running Scenario {i}/{len(scenarios)}")
            
            log = self.run_autonomous_loop(scenario, run_id=run_id)
            logs.append(log)
            
            # Wait between runs
            if i < len(scenarios):
                print("⏸️  Waiting 10 seconds before next run...\n")
                time.sleep(10)
        
        return logs
    
    def generate_summary(self, logs: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate summary from multiple run logs.
        
        Args:
            logs: List of run logs
            
        Returns:
            Summary statistics
        """
        total = len(logs)
        successful = sum(1 for log in logs if log.get("status") == "success")
        executed = sum(1 for log in logs if log.get("final_state", {}).get("executed"))
        rejected = successful - executed
        
        return {
            "total_runs": total,
            "successful_runs": successful,
            "failed_runs": total - successful,
            "executed_proposals": executed,
            "rejected_proposals": rejected,
            "execution_rate": f"{(executed / successful * 100):.1f}%" if successful > 0 else "0%"
        }
