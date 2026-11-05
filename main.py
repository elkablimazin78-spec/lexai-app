import os
from typing import Optional
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

app = FastAPI(title="LexAI RAG Backend", version="6.4")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = os.getenv("GEMINI_API_KEY")
client= genai.Client(API_KEY=API_KEY)                

class QueryRequest(BaseModel):
    question: str
    document_text: Optional[str] = ""

class QueryResponse(BaseModel):
    answer: str
    sources: list[str]

@app.get("/")
async def read_index():
    return FileResponse("index.html")

@app.post("/api/rag-query", response_model=QueryResponse)
def handle_rag_query(request: QueryRequest):
    try:
        # Utilisation du modèle gemini-3.5-flash-lite
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key={API_KEY}"
        
        # Le prompt intègre désormais dynamiquement le texte du document et la question
        prompt_text = (
            "Tu es LexAI, un avocat-conseil expert en droit et fiscalité (doctrine KPMG). "
            "Analyse ce cas de manière rigoureuse et structure ta réponse en 3 parties : "
            "1) Qualification juridique des faits, 2) Analyse des risques, 3) Recommandations pratiques.\n\n"
            f"--- DOCUMENTS / DOSSIER À ANALYSER ---\n{request.document_text}\n----------------------------------\n\n"
            f"Cas de l'utilisateur : {request.question}"
        )

        payload = {
            "contents": [{
                "parts": [{"text": prompt_text}]
            }]
        }

        response = requests.post(url, json=payload, timeout=60)
        data = response.json()

        if "candidates" in data and len(data["candidates"]) > 0:
            answer_text = data["candidates"][0]["content"]["parts"][0]["text"]
        else:
            answer_text = f"Erreur de l'API Gemini : {str(data)}"

        return QueryResponse(
            answer=answer_text,
            sources=["Doctrine Interne KPMG — Advisory", "Fonds Réglementaire BOFIP"]
        )

    except Exception as e:
        print(f"ERREUR SERVEUR : {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)