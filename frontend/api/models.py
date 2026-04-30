from pydantic import BaseModel
from typing import Optional

class CodeRequest(BaseModel):
    code: str
    error: Optional[str] = None  

class ResponseModel(BaseModel):
    result: str
