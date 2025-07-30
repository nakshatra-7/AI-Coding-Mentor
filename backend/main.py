from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from backend.models import CodeRequest, ResponseModel
from backend.prompts import walkthrough_prompt, debug_prompt, refactor_prompt
from openai import OpenAI
from code_analysis import CodeAnalyzer, compare_code_snippets, analyze_code_quality, get_code_improvement_suggestions
import os
from dotenv import load_dotenv


load_dotenv()


OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
MODEL_NAME = "deepseek/deepseek-chat-v3-0324:free"

code_analyzer = CodeAnalyzer()

app = FastAPI(title="AI Code Mentor", description="AI-powered code assistance using DeepSeek V3 with deepdiff and tree-sitter analysis")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def ask_deepseek(prompt: str) -> str:
    """Send prompt to DeepSeek V3 via OpenRouter API and return response"""
    if not OPENROUTER_API_KEY or OPENROUTER_API_KEY == "your_openrouter_api_key_here":
        raise HTTPException(
            status_code=500, 
            detail="Please set your OpenRouter API key in the .env file"
        )
    
    try:
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=OPENROUTER_API_KEY,
            default_headers={
                "HTTP-Referer": "http://localhost:3000", 
                "X-Title": "AI Code Mentor"  
            }
        )
        
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": "You are an expert programming mentor. Provide clear, helpful explanations and code improvements."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=2000,
            temperature=0.3,
            top_p=0.9,
        )
        
        return response.choices[0].message.content.strip()
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OpenRouter API error: {str(e)}")

@app.get("/")
async def root():
    return {"message": "AI Code Mentor API is running!"}

@app.post("/walkthrough", response_model=ResponseModel)
async def walkthrough(req: CodeRequest):
    """Explain code line by line"""
    if not req.code.strip():
        raise HTTPException(status_code=400, detail="Code cannot be empty")
    
    prompt = walkthrough_prompt(req.code)
    result = await ask_deepseek(prompt)
    return ResponseModel(result=result)

@app.post("/debug", response_model=ResponseModel)
async def debug(req: CodeRequest):
    """Find and fix bugs in code"""
    if not req.code.strip():
        raise HTTPException(status_code=400, detail="Code cannot be empty")
    
    prompt = debug_prompt(req.code, req.error)
    result = await ask_deepseek(prompt)
    return ResponseModel(result=result)

@app.post("/refactor", response_model=ResponseModel)
async def refactor(req: CodeRequest):
    """Refactor and optimize code"""
    if not req.code.strip():
        raise HTTPException(status_code=400, detail="Code cannot be empty")
    
    prompt = refactor_prompt(req.code)
    result = await ask_deepseek(prompt)
    return ResponseModel(result=result)

@app.post("/analyze")
async def analyze_code(req: CodeRequest):
    """Analyze code structure and quality using tree-sitter"""
    if not req.code.strip():
        raise HTTPException(status_code=400, detail="Code cannot be empty")
    
    try:
        analysis = analyze_code_quality(req.code)
        return {
            "analysis": analysis,
            "message": "Code analysis completed successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")

@app.post("/compare")
async def compare_code(req: dict):
    """Compare two code snippets using deepdiff"""
    original_code = req.get("original_code", "")
    modified_code = req.get("modified_code", "")
    
    if not original_code.strip() or not modified_code.strip():
        raise HTTPException(status_code=400, detail="Both original and modified code are required")
    
    try:
        comparison = compare_code_snippets(original_code, modified_code)
        return {
            "comparison": comparison,
            "message": "Code comparison completed successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comparison error: {str(e)}")

@app.post("/improve")
async def get_improvements(req: dict):
    """Get code improvement suggestions based on analysis"""
    original_code = req.get("original_code", "")
    modified_code = req.get("modified_code", "")
    
    if not original_code.strip() or not modified_code.strip():
        raise HTTPException(status_code=400, detail="Both original and modified code are required")
    
    try:
        improvements = get_code_improvement_suggestions(original_code, modified_code)
        return {
            "improvements": improvements,
            "message": "Improvement analysis completed successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Improvement analysis error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
