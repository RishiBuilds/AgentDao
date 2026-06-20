"""Run the full autonomous agent governance loop."""

import os
import json
from pathlib import Path
from dotenv import load_dotenv
from src.agents.autonomous_orchestrator import AutonomousOrchestrator

load_dotenv()

RUN_LOGS_DIR = Path("run_logs")


def main():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key or api_key == "your_groq_api_key_here":
        print("ERROR: Set GROQ_API_KEY in agents/.env")
        return

    backend_url = os.getenv("BACKEND_URL", "http://localhost:3001")

    print("AUTONOMOUS AGENT LOOP")
    print("=" * 80)
    print(f"Backend URL: {backend_url}")
    print("=" * 80)

    orchestrator = AutonomousOrchestrator(
        api_key=api_key,
        backend_url=backend_url,
        target_address="0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
    )

    scenarios = [
        "Create a focused Twitter campaign for Web3 developers. "
        "Budget: 0.1 MON for sponsored tweets and community engagement. "
        "Duration: 1 week with clear KPIs.",
        "Launch a massive global advertising blitz across TV, radio, and billboards. "
        "Budget: 0.75 MON for 2-month campaign with celebrity endorsements. "
        "High visibility but expensive and risky.",
        "Run an experimental NFT drop campaign with limited edition DAO badges. "
        "Budget: 0.25 MON for smart contract development, art, and marketing. "
        "New approach with uncertain ROI but strong community potential.",
    ]

    print(f"\nRunning {len(scenarios)} autonomous scenarios...\n")

    logs = orchestrator.run_multiple_scenarios(scenarios)

    print("\n" + "=" * 80)
    print("FINAL SUMMARY")
    print("=" * 80 + "\n")

    summary = orchestrator.generate_summary(logs)
    for key, value in summary.items():
        print(f"  {key.replace('_', ' ').title()}: {value}")

    print("\n" + "=" * 80)
    print("RUN DETAILS")
    print("=" * 80 + "\n")

    for i, log in enumerate(logs, 1):
        print(f"Scenario {i}: {log['run_id']}")
        print(f"  Status: {log.get('status', 'unknown').upper()}")
        print(f"  Executed: {log.get('final_state', {}).get('executed', False)}")
        if "proposal_id" in log:
            print(f"  Proposal ID: {log['proposal_id']}")
        if "transactions" in log:
            print("  Transactions:")
            for tx_type, tx_hash in log["transactions"].items():
                print(f"    - {tx_type}: {tx_hash}")
        print()

    RUN_LOGS_DIR.mkdir(exist_ok=True)
    master_summary = {"summary": summary, "runs": logs, "scenarios": scenarios}
    summary_path = RUN_LOGS_DIR / "master_summary.json"
    with open(summary_path, "w") as f:
        json.dump(master_summary, f, indent=2)

    print(f"Master summary saved to: {summary_path}")

    successful_runs = [log for log in logs if log.get("status") == "success"]
    print(f"\nSuccessful runs: {len(successful_runs)}/{len(logs)}")

    for i, log in enumerate(logs, 1):
        if "transactions" in log:
            print(f"\nScenario {i} transaction hashes:")
            for tx_type, tx_hash in log["transactions"].items():
                print(f"  {tx_type}: https://explorer.testnet.monad.xyz/tx/{tx_hash}")


if __name__ == "__main__":
    main()
