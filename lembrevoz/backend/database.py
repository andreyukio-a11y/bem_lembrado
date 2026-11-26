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
    if not text:
        return {"title": "", "med_name": "", "dose": ""}
    txt = text.lower()

    # Dose (número + unidade)
    dose_match = re.search(r'(\d+(?:[.,]\d+)?\s*(?:mg|ml|g|caps|comprimidos|gotas))', txt)
    dose = dose_match.group(1) if dose_match else ""

    # Condições de saúde e indicações comuns
    condicoes = [
        (r'\bpress[aã]o\b', 'Remédio de Pressão'),
        (r'\bansiedade\b', 'Remédio de Ansiedade'),
        (r'\bdiabetes\b', 'Remédio de Diabetes'),
        (r'\bcolesterol\b', 'Remédio de Colesterol'),
        (r'\best[oô]mago\b', 'Remédio de Estômago'),
        (r'\bcora[cç][aã]o\b', 'Remédio do Coração'),
        (r'\btireoide\b', 'Remédio de Tireoide'),
        (r'\b(?:dormir|sono)\b', 'Remédio para Dormir'),
        (r'\bcalmante\b', 'Tomar Calmante'),
        (r'\bdor\b', 'Remédio para Dor'),
        (r'\bfebre\b', 'Remédio para Febre'),
        (r'\bgripe\b', 'Remédio para Gripe'),
    ]
    for cond_pat, cond_nome in condicoes:
        if re.search(cond_pat, txt):
            title = cond_nome + (f" ({dose})" if dose else "")
            return {"title": title, "med_name": cond_nome, "dose": dose}

    # Remédios conhecidos ou palavra 'pressao', 'diabetes'
    med_match = re.search(r'\b(dipirona|losartana|paracetamol|ibuprofeno|omeprazol|atenolol|metformina|sinvastatina|clonazepam|rivotril|fluoxetina|sertralina|diazepam|insulina|antibi[oó]tico|antial[eé]rgico|vitamina|col[ií]rio|pomada)\b', txt)
    if med_match:
        med = med_match.group(1).capitalize()
        title = f"Tomar {med}" + (f" ({dose})" if dose else "")
        return {"title": title, "med_name": med, "dose": dose}

    # Verbo de ação relevante
    action_match = re.search(r'\b(tomar|ingestir|beber|aplicar|usar)\b', txt)
    action = action_match.group(1).capitalize() if action_match else "Tomar"

    # Nome da medicação após verbo
    med_word_match = re.search(r'\b(?:tomar|ingestir|beber|aplicar|usar)\s+([a-zçãáâéêíóôú]+)', txt)
    medication = med_word_match.group(1).capitalize() if med_word_match else ""

    # Evita palavras comuns de virarem remédio ("meu", "o", "um", "para", "hoje", "amanha")
    palavras_invalidas = {"meu", "minha", "o", "a", "um", "uma", "para", "hoje", "amanha", "cedo", "tarde", "noite", "de", "do", "da"}
    if medication.lower() in palavras_invalidas:
        medication = ""

    if medication:
        title = f"{action} {medication}"
        if dose:
            title += f" ({dose})"
    elif re.search(r'\b(remedio|medicacao|comprimido)\b', txt):
        title = "Tomar Remédio"
        medication = "Remédio"
    else:
        title = ""

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
        data_hora_fim TEXT,      -- Formato ISO: YYYY-MM-DDTHH:MM:SS (Término para intervalos)
        tipo_notificacao TEXT DEFAULT 'padrao', -- 'alarme', 'notificacao', 'silencioso'
        status TEXT DEFAULT 'pendente', -- 'pendente', 'concluido', 'aguardando_confirmacao'
        
        -- Campos específicos para medicação (fechamento de ciclo)
        tempo_checagem_minutos INTEGER DEFAULT 15,
        horario_checagem TEXT,
        confirmado_tomado INTEGER DEFAULT 0, -- 0 = Não, 1 = Sim
        data_hora_confirmacao TEXT,
        fixado INTEGER DEFAULT 0, -- 0 = Normal, 1 = Fixado no topo
        med_name TEXT DEFAULT '',  -- Nome da medicação extraída
        dose TEXT DEFAULT '',      -- Dose extraída (ex: "500 mg")
        usuario_id TEXT DEFAULT 'idoso', -- 'idoso', 'cuidador' ou identificador pessoal
        
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
    try:
        cursor.execute("ALTER TABLE items ADD COLUMN usuario_id TEXT DEFAULT 'idoso'")
        conn.commit()
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE items ADD COLUMN data_hora_fim TEXT DEFAULT NULL")
        conn.commit()
    except Exception:
        pass

    # Tabela de Usuários (Login por e-mail/senha + tipo e finalidade de uso)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'simplificado',
        purpose TEXT DEFAULT 'rotina_e_remedios',
        phone TEXT DEFAULT '',
        dependente_name TEXT DEFAULT '',
        font_size TEXT DEFAULT 'normal',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    """)
    conn.commit()
    # Garante as colunas care_code e linked_care_code na tabela users
    try:
        cursor.execute("ALTER TABLE items ADD COLUMN tipo_notificacao TEXT DEFAULT 'padrao'")
        conn.commit()
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN care_code TEXT DEFAULT ''")
        conn.commit()
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN linked_care_code TEXT DEFAULT ''")
        conn.commit()
    except Exception:
        pass

    # Garante que todo usuário idoso/simplificado tenha um código único de vínculo
    try:
        cursor.execute("SELECT id, care_code FROM users WHERE care_code IS NULL OR care_code = ''")
        rows = cursor.fetchall()
        for r in rows:
            code = f"BL-{secrets.randbelow(9000) + 1000}"
            cursor.execute("UPDATE users SET care_code = ? WHERE id = ?", (code, r["id"]))
        conn.commit()
    except Exception:
        pass

    conn.close()

def list_items(usuario_id=None, dependente_id=None):
    conn = get_connection()
    cursor = conn.cursor()
    # Se o cuidador estiver visualizando seus itens e os do dependente
    if dependente_id and usuario_id:
        cursor.execute("SELECT * FROM items WHERE usuario_id IN (?, ?) ORDER BY fixado DESC, id DESC", (usuario_id, dependente_id))
    elif usuario_id == 'cuidador':
        cursor.execute("SELECT * FROM items WHERE usuario_id IN ('idoso', 'padrao') ORDER BY fixado DESC, id DESC")
    elif usuario_id and usuario_id != 'todos':
        # Se usuário específico, busca os itens desse usuário (ou legados 'idoso'/'padrao')
        cursor.execute("SELECT * FROM items WHERE usuario_id = ? OR (usuario_id IN ('idoso', 'padrao') AND ? IN ('idoso', 'default')) ORDER BY fixado DESC, id DESC", (usuario_id, usuario_id))
    else:
        cursor.execute("SELECT * FROM items ORDER BY fixado DESC, id DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def add_item(titulo, transcricao_original, categoria, data_hora_alvo, tempo_checagem=15, usuario_id='idoso', data_hora_fim=None, tipo_notificacao='padrao'):
    conn = get_connection()
    cursor = conn.cursor()

    # Se titulo já é específico e conciso (<= 6 palavras), prioriza ele para não sobrepor múltiplos itens
    is_concise_title = bool(titulo and len(titulo.strip().split()) <= 6)
    item_txt = titulo if is_concise_title else (transcricao_original or titulo)

    parsed = parse_reminder_title(item_txt)
    if is_concise_title:
        smart_title = titulo.strip()
    else:
        smart_title = parsed["title"] if parsed["title"] else ""
        if not smart_title:
            from ai_service import clean_concise_title
            smart_title = clean_concise_title(item_txt, categoria)

    med_name = parsed["med_name"] or (smart_title if categoria == "medicacao" else "")
    dose = parsed["dose"]

    cursor.execute("""
    INSERT INTO items (titulo, transcricao_original, categoria, data_hora_alvo, data_hora_fim, tipo_notificacao, tempo_checagem_minutos, med_name, dose, usuario_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (smart_title, transcricao_original, categoria, data_hora_alvo, data_hora_fim, tipo_notificacao or 'padrao', tempo_checagem, med_name, dose, usuario_id or 'idoso'))
    conn.commit()
    item_id = cursor.lastrowid
    conn.close()
    return item_id

def update_item_notification(item_id, tipo_notificacao):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE items SET tipo_notificacao = ? WHERE id = ?", (tipo_notificacao, item_id))
    conn.commit()
    conn.close()

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

def get_adherence_report(usuario_id=None):
    conn = get_connection()
    cursor = conn.cursor()
    if usuario_id and usuario_id != 'todos':
        cursor.execute("SELECT * FROM items WHERE categoria = 'medicacao' AND (usuario_id = ? OR usuario_id IN ('idoso', 'padrao')) ORDER BY id DESC", (usuario_id,))
    else:
        cursor.execute("SELECT * FROM items WHERE categoria = 'medicacao' ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()

    total = len(rows)
    tomados = sum(1 for r in rows if r["confirmado_tomado"])
    pendentes = total - tomados
    taxa = round((tomados / total) * 100) if total > 0 else 100

    historico = []
    history = []
    for r in rows:
        dt_str = (r["data_hora_alvo"] or r["criado_em"] or "")[:16].replace("T", " ")
        historico.append({
            "id": r["id"],
            "titulo": r["titulo"],
            "horario_alvo": r["data_hora_alvo"],
            "confirmado": bool(r["confirmado_tomado"]),
            "data_confirmacao": r["data_hora_confirmacao"],
            "status": r["status"]
        })
        history.append({
            "date": f"{dt_str} - {r['titulo']}" if dt_str else r["titulo"],
            "taken": bool(r["confirmado_tomado"]),
            "dose_count": 1
        })

    return {
        "total_doses": total,
        "taken_doses": tomados,
        "pending_doses": pendentes,
        "doses_tomadas": tomados,
        "doses_pendentes": pendentes,
        "taxa_adesao": taxa,
        "adherence_rate": round(tomados / total, 4) if total > 0 else 1.0,
        "historico": historico,
        "history": history
    }

# ==========================================================
# Autenticação de Usuários (E-mail e Senha)
# ==========================================================
import hashlib
import secrets

def _hash_password(password: str, salt: str = None) -> str:
    if salt is None:
        salt = secrets.token_hex(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000)
    return f"{salt}${dk.hex()}"

def _verify_password(password: str, stored_hash: str) -> bool:
    try:
        salt, expected = stored_hash.split("$", 1)
        return _hash_password(password, salt) == stored_hash
    except Exception:
        return False

def register_user(name: str, email: str, password: str, role: str = "simplificado", purpose: str = "rotina_e_remedios", phone: str = "", dependente_name: str = "") -> dict:
    email_clean = (email or "").strip().lower()
    if not email_clean or "@" not in email_clean:
        raise ValueError("E-mail inválido.")
    if not password or len(password) < 4:
        raise ValueError("A senha deve ter pelo menos 4 caracteres.")
    if not name or not name.strip():
        raise ValueError("O nome é obrigatório.")

    user_id = "usr_" + secrets.token_hex(6)
    care_code = f"BL-{secrets.randbelow(9000) + 1000}"
    font_size = "grande" if role == "simplificado" else "normal"
    pw_hash = _hash_password(password)

    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO users (id, name, email, password_hash, role, purpose, phone, dependente_name, font_size, care_code)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (user_id, name.strip(), email_clean, pw_hash, role, purpose, phone.strip(), dependente_name.strip(), font_size, care_code))
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        raise ValueError("Já existe uma conta cadastrada com este e-mail.")
    conn.close()

    return {
        "id": user_id,
        "name": name.strip(),
        "email": email_clean,
        "role": role,
        "purpose": purpose,
        "phone": phone.strip(),
        "dependente_name": dependente_name.strip(),
        "font_size": font_size,
        "care_code": care_code
    }

def authenticate_user(email: str, password: str) -> dict:
    email_clean = (email or "").strip().lower()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email_clean,))
    row = cursor.fetchone()
    conn.close()

    if not row or not _verify_password(password or "", row["password_hash"]):
        return None

    return {
        "id": row["id"],
        "name": row["name"],
        "email": row["email"],
        "role": row["role"],
        "purpose": row["purpose"],
        "phone": row["phone"] or "",
        "dependente_name": row["dependente_name"] or "",
        "font_size": row["font_size"] or ("grande" if row["role"] == "simplificado" else "normal"),
        "care_code": row["care_code"] if "care_code" in row.keys() else "",
        "linked_care_code": row["linked_care_code"] if "linked_care_code" in row.keys() else ""
    }

def link_care_code(cuidador_id: str, care_code: str) -> dict:
    """Vincula um cuidador a uma pessoa idosa/dependente através do código curto (ex: BL-4891 ou BL4891)."""
    raw_code = (care_code or "").strip().upper()
    sanitized = re.sub(r'[^A-Z0-9]', '', raw_code)
    if not sanitized:
        raise ValueError("Informe o código de vínculo (ex: BL-1234).")

    conn = get_connection()
    cursor = conn.cursor()
    # Busca flexível: aceita com ou sem hífen, minúsculas ou maiúsculas
    cursor.execute("""
        SELECT id, name, phone, role, care_code 
        FROM users 
        WHERE REPLACE(REPLACE(UPPER(care_code), '-', ''), ' ', '') = ?
           OR UPPER(care_code) = ?
           OR UPPER(care_code) = ?
    """, (sanitized, raw_code, f"BL-{sanitized.replace('BL', '')}"))
    idoso = cursor.fetchone()

    if not idoso:
        conn.close()
        raise ValueError(f"Nenhum perfil encontrado com o código '{raw_code}'. Verifique o código exibido no perfil da pessoa cuidada.")

    try:
        cursor.execute("""
            UPDATE users 
            SET linked_care_code = ?, dependente_name = ?
            WHERE id = ?
        """, (idoso["care_code"] or raw_code, idoso["name"], cuidador_id))
        conn.commit()
    except Exception:
        pass
    conn.close()

    return {
        "success": True,
        "dependente_id": idoso["id"],
        "dependente_name": idoso["name"],
        "care_code": idoso["care_code"] or raw_code
    }

def change_user_password(user_id: str, current_password: str, new_password: str) -> bool:
    """Altera a senha do usuário após confirmar a senha atual."""
    if not new_password or len(new_password) < 4:
        raise ValueError("A nova senha deve ter pelo menos 4 caracteres.")

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT password_hash FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()

    if not row or not _verify_password(current_password or "", row["password_hash"]):
        conn.close()
        raise ValueError("Senha atual incorreta.")

    new_hash = _hash_password(new_password)
    cursor.execute("UPDATE users SET password_hash = ? WHERE id = ?", (new_hash, user_id))
    conn.commit()
    conn.close()
    return True

