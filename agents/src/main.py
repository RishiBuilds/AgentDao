from fastapi import FastAPI
from dotenv import load_dotenv
import uvicorn

load_dotenv()

app = FastAPI(title="AgentDAO AI Agents", version="1.0.0")

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "AgentDAO Agents Service is running"}

@app.get("/")
async def root():
    return {
        "message": "AgentDAO AI Agents API",
        "docs": "Use scripts/run_autonomous_loop.py for the autonomous governance loop",
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
