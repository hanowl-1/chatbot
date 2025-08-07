from fastapi import FastAPI, HTTPException, UploadFile, File, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import json
import os
import asyncio
from datetime import datetime
import httpx
from dotenv import load_dotenv

# AI Model imports
import openai
import anthropic
import google.generativeai as genai

load_dotenv()

app = FastAPI(title="SuperMembers Chatbot Tester API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
faq_data = {}
chat_history = []

# Load default FAQ data if exists
FAQ_PATH = "../data/processed_qna.json"
if os.path.exists(FAQ_PATH):
    with open(FAQ_PATH, 'r', encoding='utf-8') as f:
        faq_data = json.load(f)

# Pydantic models
class ChatRequest(BaseModel):
    message: str
    model: str
    api_key: Optional[str] = None
    temperature: float = 0.1
    max_tokens: int = 500

class APIConfig(BaseModel):
    openai_key: Optional[str] = None
    anthropic_key: Optional[str] = None
    google_key: Optional[str] = None

class TestResult(BaseModel):
    model: str
    response: str
    tokens_used: int
    response_time: float
    cost: float
    timestamp: datetime

# System prompt
SYSTEM_PROMPT = """당신은 슈퍼멤버스 플랫폼 전용 고객지원 AI 챗봇이다.

당신의 역할은 사용자의 질문에 대해 슈퍼멤버스 플랫폼 전용 FAQ 데이터만을 기반으로 정확하고 간결한 응답을 생성하는 것이다.

질문자는 '광고주(소상공인)' 또는 '블로거' 두 유형 중 하나이다.

응답을 생성하기 전, 다음 절차에 따라 판단하라:

[1] 이 질문이 슈퍼멤버스만의 고유한 질문인지 확인하라.
- 슈퍼멤버스의 서비스나 운영 정책과 무관한 일반적인 질문은 답변하지 않는다.
- FAQ JSON에 명시적으로 존재하지 않으면 반드시 [null]로 응답한다.

[2] 질문자가 '광고주'인지 '블로거'인지 문맥을 통해 분류하라.
- '블로거', '포인트', '등급', '리뷰', '캠페인 제안', '앱', '환급' 등의 단어가 포함된 경우: 블로거
- '광고', '매장', '체험단', '방문 인원', '세금계산서', '리뷰 미작성', '광고 해지' 등은 광고주

[3] 질문이 FAQ JSON의 question 필드와 의미적으로 일치하는지 확인하라.
- 핵심 의미가 같아야 일치로 간주한다.
- 의미가 일치하면 해당 answer를 그대로 출력한다.
- 일치하지 않으면 반드시 [null]을 출력한다.

FAQ 데이터:
{faq_data}"""

# Model pricing (per 1K tokens)
PRICING = {
    "gpt-4": {"input": 0.03, "output": 0.06},
    "gpt-4-turbo": {"input": 0.01, "output": 0.03},
    "gpt-3.5-turbo": {"input": 0.0005, "output": 0.0015},
    "claude-3-opus": {"input": 0.015, "output": 0.075},
    "claude-3-sonnet": {"input": 0.003, "output": 0.015},
    "claude-3-haiku": {"input": 0.00025, "output": 0.00125},
    "gemini-pro": {"input": 0.0005, "output": 0.0015}
}

@app.get("/")
async def root():
    return {"message": "SuperMembers Chatbot Tester API", "version": "1.0.0"}

@app.post("/api/upload-faq")
async def upload_faq(file: UploadFile = File(...)):
    """Upload FAQ JSON file"""
    global faq_data
    
    if not file.filename.endswith('.json'):
        raise HTTPException(status_code=400, detail="Only JSON files are allowed")
    
    try:
        contents = await file.read()
        faq_data = json.loads(contents.decode('utf-8'))
        
        # Save to data directory
        with open("../data/processed_qna.json", 'w', encoding='utf-8') as f:
            json.dump(faq_data, f, ensure_ascii=False, indent=2)
            
        return {"message": "FAQ data uploaded successfully", "count": sum(len(v) for v in faq_data.values())}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing file: {str(e)}")

@app.get("/api/faq-data")
async def get_faq_data():
    """Get current FAQ data"""
    return {"data": faq_data, "count": sum(len(v) for v in faq_data.values())}

@app.post("/api/chat")
async def chat(request: ChatRequest):
    """Process chat request with selected AI model"""
    start_time = datetime.now()
    
    try:
        # Prepare prompt with FAQ data
        prompt = SYSTEM_PROMPT.format(faq_data=json.dumps(faq_data, ensure_ascii=False))
        
        if request.model.startswith("gpt"):
            response, tokens = await process_openai(request, prompt)
        elif request.model.startswith("claude"):
            response, tokens = await process_anthropic(request, prompt)
        elif request.model.startswith("gemini"):
            response, tokens = await process_google(request, prompt)
        else:
            raise HTTPException(status_code=400, detail="Unsupported model")
        
        # Calculate response time and cost
        response_time = (datetime.now() - start_time).total_seconds()
        cost = calculate_cost(request.model, tokens)
        
        # Create test result
        result = TestResult(
            model=request.model,
            response=response,
            tokens_used=tokens,
            response_time=response_time,
            cost=cost,
            timestamp=datetime.now()
        )
        
        # Store in history
        chat_history.append(result.dict())
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def process_openai(request: ChatRequest, system_prompt: str):
    """Process request with OpenAI models"""
    if not request.api_key:
        raise HTTPException(status_code=400, detail="OpenAI API key required")
    
    client = openai.OpenAI(api_key=request.api_key)
    
    response = client.chat.completions.create(
        model=request.model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": request.message}
        ],
        temperature=request.temperature,
        max_tokens=request.max_tokens
    )
    
    return response.choices[0].message.content, response.usage.total_tokens

async def process_anthropic(request: ChatRequest, system_prompt: str):
    """Process request with Anthropic models"""
    if not request.api_key:
        raise HTTPException(status_code=400, detail="Anthropic API key required")
    
    client = anthropic.Anthropic(api_key=request.api_key)
    
    response = client.messages.create(
        model=request.model,
        system=system_prompt,
        messages=[{"role": "user", "content": request.message}],
        temperature=request.temperature,
        max_tokens=request.max_tokens
    )
    
    # Estimate tokens (Anthropic doesn't provide usage stats)
    estimated_tokens = len(system_prompt.split()) + len(request.message.split()) + len(response.content[0].text.split())
    
    return response.content[0].text, estimated_tokens * 1.3  # 1.3x multiplier for token estimation

async def process_google(request: ChatRequest, system_prompt: str):
    """Process request with Google Gemini models"""
    if not request.api_key:
        raise HTTPException(status_code=400, detail="Google API key required")
    
    genai.configure(api_key=request.api_key)
    model = genai.GenerativeModel(request.model)
    
    response = model.generate_content(
        f"{system_prompt}\n\nUser: {request.message}",
        generation_config=genai.types.GenerationConfig(
            temperature=request.temperature,
            max_output_tokens=request.max_tokens,
        )
    )
    
    # Estimate tokens
    estimated_tokens = len(system_prompt.split()) + len(request.message.split()) + len(response.text.split())
    
    return response.text, estimated_tokens * 1.3

def calculate_cost(model: str, tokens: int):
    """Calculate cost based on model and tokens"""
    if model in PRICING:
        # Simplified calculation (assuming equal input/output)
        avg_price = (PRICING[model]["input"] + PRICING[model]["output"]) / 2
        return (tokens / 1000) * avg_price
    return 0.0

@app.get("/api/test-history")
async def get_test_history():
    """Get chat test history"""
    return {"history": chat_history, "total": len(chat_history)}

@app.post("/api/batch-test")
async def batch_test(test_queries: List[str], models: List[str], api_config: APIConfig):
    """Run batch tests across multiple models"""
    results = []
    
    for query in test_queries:
        for model in models:
            try:
                request = ChatRequest(
                    message=query,
                    model=model,
                    api_key=getattr(api_config, f"{model.split('-')[0]}_key", None)
                )
                result = await chat(request)
                results.append({
                    "query": query,
                    "model": model,
                    "response": result.response,
                    "tokens": result.tokens_used,
                    "cost": result.cost,
                    "time": result.response_time
                })
            except Exception as e:
                results.append({
                    "query": query,
                    "model": model,
                    "error": str(e)
                })
    
    return {"results": results, "summary": generate_summary(results)}

def generate_summary(results):
    """Generate summary statistics from batch test results"""
    summary = {
        "total_tests": len(results),
        "successful_tests": len([r for r in results if "error" not in r]),
        "failed_tests": len([r for r in results if "error" in r]),
        "avg_response_time": sum(r.get("time", 0) for r in results if "time" in r) / len([r for r in results if "time" in r]) if results else 0,
        "total_cost": sum(r.get("cost", 0) for r in results if "cost" in r),
        "avg_tokens": sum(r.get("tokens", 0) for r in results if "tokens" in r) / len([r for r in results if "tokens" in r]) if results else 0
    }
    return summary

@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    """WebSocket endpoint for real-time chat"""
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            request = ChatRequest(**data)
            result = await chat(request)
            await websocket.send_json(result.dict())
    except Exception as e:
        await websocket.send_json({"error": str(e)})
    finally:
        await websocket.close()

@app.get("/api/cost-estimation")
async def estimate_costs(monthly_queries: int = 10000):
    """Estimate monthly costs for different models"""
    estimations = {}
    avg_tokens_per_query = 500  # Estimated average
    
    for model, prices in PRICING.items():
        monthly_tokens = monthly_queries * avg_tokens_per_query
        input_cost = (monthly_tokens * 0.3 / 1000) * prices["input"]  # 30% input
        output_cost = (monthly_tokens * 0.7 / 1000) * prices["output"]  # 70% output
        total_cost = input_cost + output_cost
        
        estimations[model] = {
            "monthly_cost": round(total_cost, 2),
            "yearly_cost": round(total_cost * 12, 2),
            "cost_per_query": round(total_cost / monthly_queries, 4)
        }
    
    return {
        "assumptions": {
            "monthly_queries": monthly_queries,
            "avg_tokens_per_query": avg_tokens_per_query
        },
        "estimations": estimations
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)