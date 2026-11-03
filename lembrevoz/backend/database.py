import re
import os
import sqlite3
from datetime import datetime

def parse_reminder_title(text: str) -> dict:
    """Extrai informações da transcrição e devolve um dicionário com:
        - titulo: versão curta (ex.: "Tomar Dipirona (500 mg)")
        - med_name: nome da medicação (ou "")
        - dose: dose extraída (ou "")
    """
    txt = text.lower()
    # Verbo de ação relevante
    action_match = re.search(r'\b(tomar|ingestir|beber|aplicar|usar)\b', txt)
    action = action_match.group(1).capitalize() if action_match else "Lembrar"

    # Nome da medicação (palavra imediata após o verbo)
    med_match = re.search(r'\b(?:tomar|ingestir|beber|aplicar|usar)\s+([a-zçãáâéêíóôú]+)', txt)
    medication = med_match.group(1).capitalize() if med_match else ""

    # Dose (número + unidade)
    dose_match = re.search(r'(\d+(?:[.,]\d+)?\s*(?:mg|ml|g|caps|comprimidos|gotas))', txt)
    dose = dose_match.group(1) if dose_match else ""

    if medication:
        title = f"{action} {medication}"
        if dose:
            title += f" ({dose})"
    else:
        title = action

    return {"title": title, "med_name": medication, "dose": dose}

DB_PATH = os.path.join(os.path.dirname(__file__), "lembrevoz.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Tabela principal de itens (Tarefas, Compromissos e Medicações)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        transcricao_original TEXT,
        categoria TEXT NOT NULL, -- 'medicacao', 'tarefa', 'compromisso'
        data_hora_alvo TEXT,     -- Formato ISO: YYYY-MM-DDTHH:MM:SS
        status TEXT DEFAULT 'pendente', -- 'pendente', 'concluido', 'aguardando_confirmacao'
        
        -- Campos específicos para medicação (fechamento de ciclo)
        tempo_checagem_minutos INTEGER DEFAULT 15,
        horario_checagem TEXT,
        confirmado_tomado INTEGER DEFAULT 0, -- 0 = Não, 1 = Sim
        data_hora_confirmacao TEXT,
        fixado INTEGER DEFAULT 0, -- 0 = Normal, 1 = Fixado no topo
        med_name TEXT DEFAULT '',  -- Nome da medicação extraída
        dose TEXT DEFAULT '',      -- Dose extraída (ex: "500 mg")
        
        criado_em TEXT DEFAULT CURRENT_TIMESTAMP
    );
    """)
    conn.commit()

    # Garante a coluna 'fixado' se a tabela já existia
    try:
        cursor.execute("ALTER TABLE items ADD COLUMN fixado INTEGER DEFAULT 0")
        conn.commit()
    except Exception:
        pass

    # Garante as colunas med_name e dose se a tabela já existia
    try:
        cursor.execute("ALTER TABLE items ADD COLUMN med_name TEXT DEFAULT ''")
        conn.commit()
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE items ADD COLUMN dose TEXT DEFAULT ''")
        conn.commit()
    except Exception:
        pass

    conn.close()

def list_items():
    conn = get_connection()
    cursor = conn.cursor()
    # Itens fixados vêm primeiro, depois por id decrescente
    cursor.execute("SELECT * FROM items ORDER BY fixado DESC, id DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def add_item(titulo, transcricao_original, categoria, data_hora_alvo, tempo_checagem=15):
    conn = get_connection()
    cursor = conn.cursor()

    # Usa o parser inteligente para gerar título curto e extrair medicação/dose
    parsed = parse_reminder_title(transcricao_original or titulo)
    smart_title = parsed["title"] if parsed["title"] and parsed["title"] != "Lembrar" else titulo
    med_name = parsed["med_name"]
    dose = parsed["dose"]

    cursor.execute("""
    INSERT INTO items (titulo, transcricao_original, categoria, data_hora_alvo, tempo_checagem_minutos, med_name, dose)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (smart_title, transcricao_original, categoria, data_hora_alvo, tempo_checagem, med_name, dose))
    conn.commit()
    item_id = cursor.lastrowid
    conn.close()
    return item_id

def update_item_status(item_id, status, confirmado_tomado=None):
    conn = get_connection()
    cursor = conn.cursor()
    now_str = datetime.now().isoformat()
    
    if confirmado_tomado is not None:
        cursor.execute("""
        UPDATE items 
        SET status = ?, confirmado_tomado = ?, data_hora_confirmacao = ?
        WHERE id = ?
        """, (status, 1 if confirmado_tomado else 0, now_str if confirmado_tomado else None, item_id))
    else:
        cursor.execute("UPDATE items SET status = ? WHERE id = ?", (status, item_id))
        
    conn.commit()
    conn.close()

def reschedule_item(item_id, new_data_hora):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE items 
    SET data_hora_alvo = ?, status = 'pendente', confirmado_tomado = 0
    WHERE id = ?
    """, (new_data_hora, item_id))
    conn.commit()
    conn.close()

def toggle_pin(item_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT fixado FROM items WHERE id = ?", (item_id,))
    row = cursor.fetchone()
    if row:
        novo_fixado = 0 if row["fixado"] else 1
        cursor.execute("UPDATE items SET fixado = ? WHERE id = ?", (novo_fixado, item_id))
        conn.commit()
    conn.close()

def delete_item(item_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM items WHERE id = ?", (item_id,))
    conn.commit()
    conn.close()

def batch_delete(item_ids):
    if not item_ids:
        return
    conn = get_connection()
    cursor = conn.cursor()
    placeholders = ",".join("?" for _ in item_ids)
    cursor.execute(f"DELETE FROM items WHERE id IN ({placeholders})", item_ids)
    conn.commit()
    conn.close()

def get_adherence_report():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM items WHERE categoria = 'medicacao' ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()

    total = len(rows)
    tomados = sum(1 for r in rows if r["confirmado_tomado"])
    pendentes = total - tomados
    taxa = round((tomados / total) * 100) if total > 0 else 100

    historico = []
    for r in rows:
        historico.append({
            "id": r["id"],
            "titulo": r["titulo"],
            "horario_alvo": r["data_hora_alvo"],
            "confirmado": bool(r["confirmado_tomado"]),
            "data_confirmacao": r["data_hora_confirmacao"],
            "status": r["status"]
        })

    return {
        "total_doses": total,
        "doses_tomadas": tomados,
        "doses_pendentes": pendentes,
        "taxa_adesao": taxa,
        "historico": historico
    }

