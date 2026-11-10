from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional
import os
import uvicorn

from database import init_db, list_items, add_item, update_item_status, delete_item, reschedule_item, toggle_pin, batch_delete, get_adherence_report, update_item_notification
from ai_service import classify_and_extract

# Inicializa o banco de dados
init_db()

app = FastAPI(title="LembreVoz API", description="Backend do aplicativo de organização e lembretes por voz")

# Habilita CORS para testes locais e em rede
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class VoiceRequest(BaseModel):
    transcription: str
    usuario_id: Optional[str] = "idoso"

class StatusUpdateRequest(BaseModel):
    status: str
    confirmado_tomado: Optional[bool] = None

@app.get("/api/items")
def get_items(usuario_id: Optional[str] = None):
    return list_items(usuario_id=usuario_id)

@app.post("/api/process-voice")
def process_voice(req: VoiceRequest):
    if not req.transcription or not req.transcription.strip():
        raise HTTPException(status_code=400, detail="A transcrição não pode ser vazia.")
    
    # 1. Classificação e extração inteligente (suporta 1 ou múltiplos lembretes)
    extracted = classify_and_extract(req.transcription)
    clean_text = extracted.get("transcricao_limpa", req.transcription)
    
    items_to_create = extracted.get("itens", [])
    if not items_to_create:
        items_to_create = [{
            "titulo": extracted.get("titulo", clean_text),
            "categoria": extracted.get("categoria", "tarefa"),
            "data_hora_alvo": extracted.get("data_hora_alvo"),
            "tempo_checagem_minutos": extracted.get("tempo_checagem_minutos", 15)
        }]

    # 2. Persistência de cada item no banco SQLite associado ao usuário
    active_user = req.usuario_id or "idoso"
    created_items = []
    for it in items_to_create:
        item_id = add_item(
            titulo=it.get("titulo", clean_text),
            transcricao_original=clean_text,
            categoria=it.get("categoria", "tarefa"),
            data_hora_alvo=it.get("data_hora_alvo"),
            tempo_checagem=it.get("tempo_checagem_minutos", 15),
            usuario_id=active_user,
            data_hora_fim=it.get("data_hora_fim"),
            tipo_notificacao=it.get("tipo_notificacao", "padrao")
        )
        it_copy = dict(it)
        it_copy["item_id"] = item_id
        created_items.append(it_copy)
    
    return {
        "success": True,
        "total_created": len(created_items),
        "items": created_items,
        "item_id": created_items[0]["item_id"] if created_items else None,
        "data": extracted
    }

class RescheduleRequest(BaseModel):
    data_hora_alvo: str

class BatchDeleteRequest(BaseModel):
    item_ids: list

@app.post("/api/items/batch-delete")
def batch_remove(req: BatchDeleteRequest):
    batch_delete(req.item_ids)
    return {"success": True}

@app.get("/api/reports/adherence")
def adherence_report():
    report = get_adherence_report()
    return report

@app.post("/api/items/{item_id}/status")
def change_status(item_id: int, req: StatusUpdateRequest):
    update_item_status(item_id, req.status, req.confirmado_tomado)
    return {"success": True}

@app.delete("/api/items/{item_id}")
def remove_item(item_id: int):
    delete_item(item_id)
    return {"success": True}

@app.post("/api/items/{item_id}/reschedule")
def reschedule(item_id: int, req: RescheduleRequest):
    reschedule_item(item_id, req.data_hora_alvo)
    return {"success": True}

class NotificationUpdateRequest(BaseModel):
    tipo_notificacao: str

@app.post("/api/items/{item_id}/notification")
def change_notification(item_id: int, req: NotificationUpdateRequest):
    update_item_notification(item_id, req.tipo_notificacao)
    return {"success": True}

@app.post("/api/items/{item_id}/pin")
def pin_item(item_id: int):
    toggle_pin(item_id)
    return {"success": True}

# Monta o frontend estático para servir na raiz "/"
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))
if os.path.exists(frontend_dir):
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
