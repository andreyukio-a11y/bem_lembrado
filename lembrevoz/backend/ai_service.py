import os
import re
import json
import unicodedata
from datetime import datetime, timedelta

# Tenta carregar .env se python-dotenv estiver instalado
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

def norm(text: str) -> str:
    """Remove acentos e converte para minúsculas para comparações infalíveis."""
    if not text:
        return ""
    return "".join(c for c in unicodedata.normalize("NFD", text) if unicodedata.category(c) != "Mn").lower()

def clean_repetitive_text(text: str) -> str:
    """
    Higieniza repetições em camadas vindas de snapshots de voz do Android/Chrome.
    Exemplo: 'fazer fazer fazer atividades' -> 'fazer atividades'
    """
    if not text:
        return ""
    
    words = text.split()
    deduped = []
    for w in words:
        if not deduped or w.lower() != deduped[-1].lower():
            deduped.append(w)
            
    tokens = deduped
    for k in range(8, 1, -1):
        i = 0
        while i + 2*k <= len(tokens):
            phrase1 = " ".join(tokens[i:i+k]).lower()
            phrase2 = " ".join(tokens[i+k:i+2*k]).lower()
            if phrase1 == phrase2:
                tokens = tokens[:i+k] + tokens[i+2*k:]
            else:
                i += 1
                
    result = " ".join(tokens)
    return result if result else text

def classify_and_extract(transcription: str, current_time: datetime = None) -> dict:
    """
    Recebe a transcrição em linguagem natural, higieniza e extrai categoria, horário e título.
    """
    if current_time is None:
        current_time = datetime.now()

    cleaned_transcription = clean_repetitive_text(transcription)

    # 1. Se houver chave do Gemini configurada, usamos a IA do Gemini
    if GEMINI_API_KEY:
        try:
            result = _call_gemini_api(cleaned_transcription, current_time)
            result["transcricao_limpa"] = cleaned_transcription
            return result
        except Exception as e:
            print(f"[Aviso] Falha na chamada da API Gemini ({e}). Usando analisador inteligente local.")

    # 2. Analisador local inteligente (Zero dependências externas)
    result = _rule_based_extraction(cleaned_transcription, current_time)
    result["transcricao_limpa"] = cleaned_transcription
    return result

def _call_gemini_api(transcription: str, current_time: datetime) -> dict:
    """Chama a API do Google Gemini usando urllib."""
    import urllib.request

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
    
    prompt = f"""
Você é o assistente inteligente do aplicativo 'Bem Lembrado'.
Analise o comando de voz do usuário e extraia as informações estruturadas.

Data e hora atual de referência: {current_time.strftime('%Y-%m-%d %H:%M:%S')} (Dia da semana: {current_time.strftime('%A')}).
Frase dita pelo usuário: "{transcription}"

Regras:
1. 'categoria' deve ser exatamente uma destas: "medicacao", "compromisso" ou "tarefa".
2. 'titulo': Um resumo curto, direto e claro em português.
3. 'data_hora_alvo': Calcule a data e hora ISO (YYYY-MM-DDTHH:MM:SS) pretendida a partir da frase.
4. 'tempo_checagem_minutos': Para medicação, padrão de 15 minutos.

Responda APENAS com um objeto JSON válido:
{{
  "categoria": "medicacao" | "compromisso" | "tarefa",
  "titulo": "string",
  "data_hora_alvo": "YYYY-MM-DDTHH:MM:SS" ou null,
  "tempo_checagem_minutos": 15
}}
"""
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.1, "responseMimeType": "application/json"}
    }
    
    req_data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=req_data, headers={"Content-Type": "application/json"})
    
    with urllib.request.urlopen(req, timeout=6) as response:
        if response.status == 200:
            res_body = response.read().decode('utf-8')
            data = json.loads(res_body)
            raw_text = data['candidates'][0]['content']['parts'][0]['text']
            return json.loads(raw_text)
        else:
            raise RuntimeError(f"Erro Gemini HTTP {response.status}")

def _rule_based_extraction(transcription: str, current_time: datetime) -> dict:
    """Analisador inteligente local avançado com normalização de acentos."""
    text_norm = norm(transcription)
    
    # 1. Identificação de Categoria
    palavras_medicacao = [
        "remedio", "medicacao", "comprimido", "pressao", "gotas", "insulina", 
        "dipirona", "losartana", "antibiotico", "farmacia", "dose", "tomar", 
        "pomada", "colirio", "injecao", "xarope", "vitamina", "inalacao"
    ]
    palavras_compromisso = [
        "medico", "consulta", "dentista", "reuniao", "encontro", "aula", 
        "visita", "prova", "seminario", "apresentacao", "entrevista", "orientador", "orientacao"
    ]
    
    categoria = "tarefa"
    if any(re.search(r'\b' + p + r'\b', text_norm) for p in palavras_medicacao):
        categoria = "medicacao"
    elif any(re.search(r'\b' + p + r'\b', text_norm) for p in palavras_compromisso):
        categoria = "compromisso"

    # 2. Resolução de Data Alvo
    target_date = None
    has_explicit_date = False

    # 'daqui a X dias' ou 'em X dias'
    dias_rel_match = re.search(r'(?:daqui\s+a|em)\s+(\d+)\s+dias?', text_norm)
    if dias_rel_match:
        target_date = current_time.date() + timedelta(days=int(dias_rel_match.group(1)))
        has_explicit_date = True
    elif re.search(r'\bdepois\s+de\s+amanha\b', text_norm):
        target_date = current_time.date() + timedelta(days=2)
        has_explicit_date = True
    elif re.search(r'\bamanha\b', text_norm):
        target_date = current_time.date() + timedelta(days=1)
        has_explicit_date = True
    elif re.search(r'\bhoje\b', text_norm):
        target_date = current_time.date()
        has_explicit_date = True
    else:
        # Dias da semana: segunda a domingo
        dias_semana = {
            'segunda': 0, 'terca': 1, 'quarta': 2,
            'quinta': 3, 'sexta': 4, 'sabado': 5, 'domingo': 6
        }
        for dia_nome, dia_num in dias_semana.items():
            if re.search(r'\b' + dia_nome + r'(?:-feira)?\b', text_norm):
                days_ahead = (dia_num - current_time.weekday()) % 7
                if days_ahead == 0:
                    days_ahead = 7
                target_date = current_time.date() + timedelta(days=days_ahead)
                has_explicit_date = True
                break

    # 3. Resolução de Intervalos em Minutos e Horas
    min_match = re.search(r'(?:daqui\s+a|em)\s+(\d+)\s*minuto', text_norm)
    if min_match:
        target_dt = current_time + timedelta(minutes=int(min_match.group(1)))
        return _format_result(categoria, transcription, target_dt)

    hour_rel_match = re.search(r'(?:daqui\s+a|em)\s+(\d+)\s*horas?', text_norm)
    if hour_rel_match:
        target_dt = current_time + timedelta(hours=int(hour_rel_match.group(1)))
        return _format_result(categoria, transcription, target_dt)

    # 4. Horário Explícito ou Período do Dia
    hour = None
    minute = 0
    hora_match = re.search(r'(?:as|as)\s*(\d{1,2})(?:[h:](\d{2})?)?', text_norm)
    if hora_match:
        hour = int(hora_match.group(1))
        minute = int(hora_match.group(2)) if hora_match.group(2) else 0

        if re.search(r'\b(?:noite|tarde)\b', text_norm) and hour < 12:
            hour += 12
        elif re.search(r'\b(?:manha|madrugada)\b', text_norm) and hour == 12:
            hour = 0
    else:
        # Períodos sem hora exata (usando word boundaries estritos para nunca confundir amanhã com manhã)
        if re.search(r'\bmeio[\s-]dia\b', text_norm):
            hour, minute = 12, 0
        elif re.search(r'\bmeia[\s-]noite\b', text_norm):
            hour, minute = 0, 0
        elif re.search(r'\b(?:de\s+|pela\s+|na\s+)?manha\b', text_norm):
            hour, minute = 8, 0
        elif re.search(r'\b(?:de\s+|a\s+|pela\s+)?tarde\b', text_norm):
            hour, minute = 14, 0
        elif re.search(r'\b(?:de\s+|a\s+|pela\s+)?noite\b', text_norm):
            hour, minute = 20, 0
        elif re.search(r'\b(?:de\s+|na\s+)?madrugada\b', text_norm):
            hour, minute = 3, 0

    if target_date is None:
        target_date = current_time.date()

    if hour is not None:
        candidate_dt = datetime(target_date.year, target_date.month, target_date.day, hour, minute)
        if not has_explicit_date and candidate_dt < current_time:
            candidate_dt += timedelta(days=1)
        target_dt = candidate_dt
    else:
        # Se foi informado dia mas não hora, agenda para 09:00 daquele dia
        if has_explicit_date:
            target_dt = datetime(target_date.year, target_date.month, target_date.day, 9, 0)
        else:
            target_dt = current_time + timedelta(hours=1)

    return _format_result(categoria, transcription, target_dt)

def _format_result(categoria: str, transcription: str, target_dt: datetime) -> dict:
    """Higieniza o título e retorna o dicionário formatado."""
    text_lower = transcription.lower()
    
    limpo = re.sub(r'^(me lembra de|lembrar de|lembrete de|anota|anotar|marcar|quero|tenho que|preciso|agendar)\s+', '', text_lower, flags=re.IGNORECASE)
    
    titulo = limpo.strip()
    if titulo:
        titulo = titulo[0].upper() + titulo[1:]
    else:
        titulo = transcription.capitalize()

    if len(titulo) > 55:
        titulo = titulo[:52] + "..."

    return {
        "categoria": categoria,
        "titulo": titulo,
        "data_hora_alvo": target_dt.strftime("%Y-%m-%dT%H:%M:%S") if target_dt else None,
        "tempo_checagem_minutos": 15
    }
