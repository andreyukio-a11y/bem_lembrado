"""
Bem Lembrado - Servidor Leve (Zero Dependências Externas)
Utiliza apenas a biblioteca padrão do Python 3 (http.server, sqlite3, json, re, urllib).
Não precisa de 'pip install' para funcionar!
"""

import http.server
import socketserver
import os
import sys
import json
import urllib.parse
import importlib
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

import database
import ai_service

PORT = 8000
FRONTEND_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "frontend"))

database.init_db()

class BemLembradoHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=FRONTEND_DIR, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/items":
            importlib.reload(database)
            items = database.list_items()
            self._send_json(items)
        elif parsed.path == "/api/reports/adherence":
            importlib.reload(database)
            report = database.get_adherence_report()
            self._send_json(report)
        else:
            super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length) if content_length > 0 else b"{}"
        try:
            payload = json.loads(post_data.decode('utf-8'))
        except Exception:
            payload = {}

        importlib.reload(database)
        importlib.reload(ai_service)

        if parsed.path == "/api/process-voice":
            transcription = payload.get("transcription", "")
            if not transcription:
                self._send_json({"error": "Transcrição vazia"}, status=400)
                return

            extracted = ai_service.classify_and_extract(transcription)
            clean_text = extracted.get("transcricao_limpa", transcription)

            item_id = database.add_item(
                titulo=extracted.get("titulo", clean_text),
                transcricao_original=clean_text,
                categoria=extracted.get("categoria", "tarefa"),
                data_hora_alvo=extracted.get("data_hora_alvo"),
                tempo_checagem=extracted.get("tempo_checagem_minutos", 15)
            )

            self._send_json({
                "success": True,
                "item_id": item_id,
                "data": extracted
            })

        elif parsed.path == "/api/items/batch-delete":
            item_ids = payload.get("item_ids", [])
            database.batch_delete(item_ids)
            self._send_json({"success": True})

        elif parsed.path.startswith("/api/items/") and parsed.path.endswith("/status"):
            parts = parsed.path.strip("/").split("/")
            item_id = int(parts[2])
            status = payload.get("status", "concluido")
            confirmado = payload.get("confirmado_tomado", None)
            database.update_item_status(item_id, status, confirmado)
            self._send_json({"success": True})

        elif parsed.path.startswith("/api/items/") and parsed.path.endswith("/reschedule"):
            parts = parsed.path.strip("/").split("/")
            item_id = int(parts[2])
            new_date = payload.get("data_hora_alvo")
            if new_date:
                database.reschedule_item(item_id, new_date)
            self._send_json({"success": True})

        elif parsed.path.startswith("/api/items/") and parsed.path.endswith("/pin"):
            parts = parsed.path.strip("/").split("/")
            item_id = int(parts[2])
            database.toggle_pin(item_id)
            self._send_json({"success": True})

        else:
            self._send_json({"error": "Rota não encontrada"}, status=404)

    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path.startswith("/api/items/"):
            try:
                importlib.reload(database)
                parts = parsed.path.strip("/").split("/")
                item_id = int(parts[2])
                database.delete_item(item_id)
                self._send_json({"success": True})
            except Exception as e:
                print(f"[Erro DELETE] Falha ao excluir item: {e}")
                self._send_json({"error": str(e)}, status=500)
        else:
            self._send_json({"error": "Rota não encontrada"}, status=404)

    def _send_json(self, data, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))

if __name__ == "__main__":
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("0.0.0.0", PORT), BemLembradoHandler) as httpd:
        print(f"\n=======================================================")
        print(f"🎙️  Bem Lembrado rodando com sucesso!")
        print(f"👉 No computador: http://localhost:{PORT}")
        print(f"👉 No celular (mesmo Wi-Fi): http://192.168.68.107:{PORT}")
        print(f"=======================================================\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nEncerrando o servidor Bem Lembrado...")
