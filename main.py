from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from google import genai
import os
from typing import Optional
import requests

app = FastAPI(title="LexAI RAG Backend", version="6.4")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=API_KEY)

# ✅ Une seule définition propre de la requête
class QueryRequest(BaseModel):
    question: str
    document_text: Optional[str] = ""

class QueryResponse(BaseModel):
    answer: str
    sources: list[str]

@app.get("/")
async def read_index():
    return FileResponse("index.html")

@app.get("/assistant.js")
async def get_assistant_js():
    return FileResponse("assistant.js")

@app.post("/chat")
async def chat_with_ai(request: QueryRequest):
    try:
        # Utilisation de request.question au lieu de request.prompt
        response = client.models.generate_content(
            model="gemini-1.5-flash", # Assurez-vous que le nom du modèle est valide (ex: gemini-1.5-flash ou gemini-1.5-flash)
            contents=request.question
        )
        return {"response": response.text}
    except Exception as e:
        print(f"ERREUR CHAT : {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/rag-query", response_model=QueryResponse)
def handle_rag_query(request: QueryRequest):
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={API_KEY}"
        
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