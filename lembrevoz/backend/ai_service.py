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
    Suporta 1 ou múltiplas intenções/atividades em uma única fala.
    """
    if current_time is None:
        current_time = datetime.now()

    cleaned_transcription = clean_repetitive_text(transcription)

    # 1. Se houver chave do Gemini configurada, usamos a IA do Gemini
    if GEMINI_API_KEY:
        try:
            result = _call_gemini_api(cleaned_transcription, current_time)
            result["transcricao_limpa"] = cleaned_transcription
            # Garante formato com 'itens'
            if "itens" not in result or not result["itens"]:
                result["itens"] = [{
                    "categoria": result.get("categoria", "tarefa"),
                    "titulo": result.get("titulo", cleaned_transcription),
                    "data_hora_alvo": result.get("data_hora_alvo"),
                    "tempo_checagem_minutos": result.get("tempo_checagem_minutos", 15)
                }]
            # Retrocompatibilidade
            first = result["itens"][0]
            result["categoria"] = first.get("categoria", "tarefa")
            result["titulo"] = first.get("titulo", cleaned_transcription)
            result["data_hora_alvo"] = first.get("data_hora_alvo")
            result["tempo_checagem_minutos"] = first.get("tempo_checagem_minutos", 15)
            return result
        except Exception as e:
            print(f"[Aviso] Falha na chamada da API Gemini ({e}). Usando analisador inteligente local.")

    # 2. Analisador local inteligente (Zero dependências externas, suporta múltiplos itens)
    result = _rule_based_multiple_extraction(cleaned_transcription, current_time)
    result["transcricao_limpa"] = cleaned_transcription
    return result

def _call_gemini_api(transcription: str, current_time: datetime) -> dict:
    """Chama a API do Google Gemini usando urllib."""
    import urllib.request

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
    
    prompt = f"""
Você é o assistente inteligente do aplicativo 'Bem Lembrado'.
Analise o comando de voz do usuário. O usuário pode ter falado UMA ou VÁRIAS atividades/tarefas/remédios em uma única frase contínua (exemplo: "tenho uma reunião às 14h, preciso comprar pão e tomar o remédio às 18h").

Regras:
1. Se houver mais de uma atividade, separe-as em elementos distintos na lista 'itens'.
2. Se houver apenas uma atividade, 'itens' terá 1 elemento.
3. Para cada item:
   - 'categoria': exatamente uma destas: "medicacao", "compromisso" ou "tarefa".
   - 'titulo': Extremamente conciso e direto (máximo 3 a 5 palavras). Apenas o nome da tarefa/remédio (ex: "Tomar Dipirona", "Reunião KPI", "Comprar Pão", "Limpar a Casa"). NUNCA coloque datas ou horários no título.
   - 'data_hora_alvo': Data e hora no formato ISO (YYYY-MM-DDTHH:MM:SS) de início calculadas a partir da fala (ou null se não informada).
   - 'data_hora_fim': Data e hora no formato ISO (YYYY-MM-DDTHH:MM:SS) de término quando a fala indicar um intervalo/duração (ex: "reunião das 14h às 16h", "aula das 8h às 11h") ou null.
   - 'tipo_notificacao': Forma de apresentação do lembrete: "alarme" (com som contínuo e voz), "notificacao" (aviso push no horário) ou "silencioso" (apenas lembrete visual na tela). Regra padrão: remédio = "alarme", compromisso = "notificacao", tarefa = "silencioso", a menos que o usuário peça explicitamente (ex: "com alarme", "sem som", "urgente").
   - 'tempo_checagem_minutos': 15 para medicação.

Data e hora atual de referência: {current_time.strftime('%Y-%m-%d %H:%M:%S')} (Dia da semana: {current_time.strftime('%A')}).
Frase dita pelo usuário: "{transcription}"

Responda APENAS com um objeto JSON válido:
{{
  "itens": [
    {{
      "categoria": "medicacao" | "compromisso" | "tarefa",
      "titulo": "string",
      "data_hora_alvo": "YYYY-MM-DDTHH:MM:SS" ou null,
      "data_hora_fim": "YYYY-MM-DDTHH:MM:SS" ou null,
      "tipo_notificacao": "alarme" | "notificacao" | "silencioso",
      "tempo_checagem_minutos": 15
    }}
  ]
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
            parsed = json.loads(raw_text)
            if isinstance(parsed, list):
                return {"itens": parsed}
            return parsed
        else:
            raise RuntimeError(f"Erro Gemini HTTP {response.status}")

def split_multiple_intents(text: str) -> list:
    """Divide um fluxo de fala contínuo com múltiplos itens em segmentos independentes."""
    if not text or not text.strip():
        return []

    s = text.strip()

    # 1. Quebras por pontuação ou conectivos de sequência
    s = re.sub(r'\s*(?:;\s*|\.\s+)\s*', ' ||| ', s)
    s = re.sub(r'\s*(?:,\s*|\s+)(?:e\s+depois|depois|em\s+seguida|al[eé]m\s+disso|e\s+tamb[eé]m)\s+', ' ||| ', s, flags=re.IGNORECASE)

    # 2. Quebras por novas orações de ação com conjunção
    s = re.sub(
        r'\s*(?:,\s*|\s+e\s+|\s+a[ií]\s+)(?=(?:eu\s+)?(?:tenho que|preciso|vou|quero|lembrar de|tomar|fazer|limpar|comprar|ir\s+ao?|consulta|reuni[aã]o))\b',
        ' ||| ',
        s,
        flags=re.IGNORECASE
    )

    parts = [p.strip() for p in s.split('|||') if p.strip()]
    valid_parts = [p for p in parts if len(p) >= 3]
    return valid_parts if valid_parts else [text.strip()]

def _rule_based_multiple_extraction(transcription: str, current_time: datetime) -> dict:
    """Extrai múltiplos itens localmente a partir de uma fala dividida."""
    intents = split_multiple_intents(transcription)

    items = []
    for piece in intents:
        item_data = _rule_based_single_extraction(piece, current_time)
        items.append(item_data)

    if not items:
        items = [_rule_based_single_extraction(transcription, current_time)]

    first = items[0]
    return {
        "itens": items,
        "categoria": first.get("categoria", "tarefa"),
        "titulo": first.get("titulo", transcription),
        "data_hora_alvo": first.get("data_hora_alvo"),
        "tempo_checagem_minutos": first.get("tempo_checagem_minutos", 15)
    }

def _rule_based_single_extraction(transcription: str, current_time: datetime) -> dict:
    """Analisador inteligente local avançado para um único item com normalização de acentos."""
    text_norm = norm(transcription)

    # Converte números por extenso comuns para dígitos em horários
    numeros_extenso = {
        r'\buma\b': '1', r'\bduas\b': '2', r'\btres\b': '3', r'\bquatro\b': '4',
        r'\bcinco\b': '5', r'\bseis\b': '6', r'\bsete\b': '7', r'\boito\b': '8',
        r'\bnove\b': '9', r'\bdez\b': '10', r'\bonze\b': '11', r'\bdoze\b': '12'
    }
    for padrao, digito in numeros_extenso.items():
        text_norm = re.sub(padrao, digito, text_norm)
    
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
        return _format_result(categoria, transcription, target_dt, None, _detect_notification_type(text_norm, categoria))

    hour_rel_match = re.search(r'(?:daqui\s+a|em)\s+(\d+)\s*horas?', text_norm)
    if hour_rel_match:
        target_dt = current_time + timedelta(hours=int(hour_rel_match.group(1)))
        return _format_result(categoria, transcription, target_dt, None, _detect_notification_type(text_norm, categoria))

    # 4. Detecção de Intervalo Determinado (Início e Término, ex: "das 2 às 4", "das 14h às 16h")
    tipo_notificacao = _detect_notification_type(text_norm, categoria)
    interval_match = re.search(r'\b(?:das|de)\s*(\d{1,2})(?:[h:](\d{2})?)?\s*(?:as|as|ate|ate as|ate as|a)\s*(\d{1,2})(?:[h:](\d{2})?)?', text_norm)
    if interval_match:
        h1 = int(interval_match.group(1))
        m1 = int(interval_match.group(2)) if interval_match.group(2) else 0
        h2 = int(interval_match.group(3))
        m2 = int(interval_match.group(4)) if interval_match.group(4) else 0

        if h1 < 12 and (re.search(r'\b(?:tarde|noite)\b', text_norm) or (categoria == "compromisso" and h1 in [1, 2, 3, 4, 5, 6])):
            h1 += 12
        if h2 < 12 and (h2 <= h1 or re.search(r'\b(?:tarde|noite)\b', text_norm) or h1 >= 12):
            h2 += 12

        if target_date is None:
            target_date = current_time.date()

        candidate_dt = datetime(target_date.year, target_date.month, target_date.day, h1, m1)
        if not has_explicit_date and candidate_dt < current_time:
            candidate_dt += timedelta(days=1)
            target_date = candidate_dt.date()
        target_dt = candidate_dt
        end_dt = datetime(target_date.year, target_date.month, target_date.day, h2, m2)
        return _format_result(categoria, transcription, target_dt, end_dt, tipo_notificacao)

    # 5. Horário Explícito ou Período do Dia
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

    return _format_result(categoria, transcription, target_dt, None, tipo_notificacao)

def _detect_notification_type(text_norm: str, categoria: str) -> str:
    """Identifica o modo de alerta pedido na fala ou aplica o padrão da categoria."""
    if re.search(r'\b(com alarme|alarme|urgente|despertador|despertar|tocar alarme)\b', text_norm):
        return "alarme"
    elif re.search(r'\b(com notificacao|notifique|notificacao|me avisa|me avise)\b', text_norm):
        return "notificacao"
    elif re.search(r'\b(sem som|silencioso|so anota|apenas anota|na tela|lembrete de tela)\b', text_norm):
        return "silencioso"
    else:
        if categoria == "medicacao":
            return "alarme"
        elif categoria == "compromisso":
            return "notificacao"
        else:
            return "silencioso"

def clean_concise_title(transcription: str, categoria: str = "tarefa") -> str:
    """
    Higieniza a transcrição para produzir um título extremamente conciso, direto e objetivo:
    - Foca apenas na atividade, demanda ou medicação.
    - Remove horários, datas e preâmbulos.
    """
    txt = transcription.strip()
    txt_lower = txt.lower()

    # 1. Trata medicação especificamente
    if categoria == "medicacao":
        dose_match = re.search(r'(\d+(?:[.,]\d+)?\s*(?:mg|ml|g|caps|comprimidos|gotas))', txt_lower)
        dose = dose_match.group(1) if dose_match else ""

        med_match = re.search(r'\b(dipirona|losartana|paracetamol|ibuprofeno|omeprazol|atenolol|metformina|sinvastatina|clonazepam|insulina|antibi[oó]tico|antial[eé]rgico|vitamina\s*[a-z0-9]*|col[ií]rio|pomada|press[aã]o|diabetes)\b', txt_lower)

        if med_match:
            med = med_match.group(1).capitalize()
            if "press" in med.lower():
                title = "Remédio de Pressão"
            elif "diabet" in med.lower():
                title = "Remédio de Diabetes"
            else:
                title = f"Tomar {med}"
            if dose:
                title += f" ({dose})"
            return title

        if re.search(r'\b(rem[eé]dio|medica[cç][aã]o|comprimido)\b', txt_lower):
            return "Tomar Remédio"

    # 2. Para compromissos e tarefas (ou medicação genérica)
    # Remove preâmbulos e verbos introdutórios
    t = re.sub(r'^(?:eu\s+)?(?:tem(?: um| uma)?|tenho(?: um| uma| que)?|preciso(?: de)?|vou|quero|lembrar(?:-me)? de|me lembr(?:a|e) de|lembrete de|anota(?:r)?|marcar|agendar|nao esquecer de|favor)\s+', '', txt, flags=re.IGNORECASE)

    # Remove termos temporais, dias da semana e datas (com e sem acento)
    patterns_to_remove = [
        r'\b(?:para|na|no|em|[aàá]s|ao|de|pela)?\s*(?:hoje|amanh[aã]|depois\s+de\s+amanh[aã])\b',
        r'\b(?:ao|ao meio|meio)[\s-]dia\b',
        r'\b(?:a|a meia|meia)[\s-]noite\b',
        r'\b(?:de|pela|na|a)?\s*(?:manh[aã]|tarde|noite|madrugada)\b',
        r'\b(?:do dia de hoje|nesta semana|neste m[eê]s)\b',
        r'\b(?:na|nesta|pr[oó]xim[ao])?\s*(?:segunda|ter[cç]a|quarta|quinta|sexta|s[aá]bado|domingo)(?:-feira)?\b',
        r'\b(?:das|de)\s*(?:\d{1,2}|uma|duas|tr[eê]s|quatro|cinco|seis|sete|oito|nove|dez|onze|doze)(?:[h:]\d{2})?\s*(?:[aàá]s|at[eé]|at[eé]\s+[aàá]s|a)\s*(?:\d{1,2}|uma|duas|tr[eê]s|quatro|cinco|seis|sete|oito|nove|dez|onze|doze)(?:[h:]\d{2})?\b',
        r'\b[aàá]s\s*(?:\d{1,2}|uma|duas|tr[eê]s|quatro|cinco|seis|sete|oito|nove|dez|onze|doze)(?:[h:]\d{2})?(?:\s*(?:da tarde|da noite|da manh[aã]))?\b',
        r'\b\d{1,2}\s*h(?:oras?)?\b',
        r'\bdaqui\s+a\s+\d+\s*(?:minutos?|horas?|dias?)\b',
        r'\bem\s+\d+\s*(?:minutos?|horas?|dias?)\b',
        r'\bpara\s+o\s+dia\s+\d{1,2}(?:\s+de\s+[a-z]+)?\b',
        r'\b(?:com alarme|urgente|sem som|silencioso|so anota|apenas anota)\b',
    ]
    for p in patterns_to_remove:
        t = re.sub(p, '', t, flags=re.IGNORECASE)

    # Remove adjetivos vazios
    t = re.sub(r'\b(importante|urgente)\b', '', t, flags=re.IGNORECASE)

    # Limpa conectivos e preposições que sobraram no começo ou fim repetidamente
    for _ in range(3):
        t = re.sub(r'^(?:para|de|em|a|[aàá]s|ao|com|sobre|na|no|nas|nos|da|do|das|dos)\s+', '', t.strip(), flags=re.IGNORECASE)
        t = re.sub(r'\s+(?:para|de|em|a|[aàá]s|ao|com|sobre|na|no|nas|nos|da|do|das|dos)$', '', t.strip(), flags=re.IGNORECASE)
        t = re.sub(r'\s+', ' ', t).strip()

    # Se sobrou algo relevante
    if t:
        words = t.split()
        if len(words) > 5:
            t = " ".join(words[:5])
            t = re.sub(r'\s+(?:para|de|em|a|[aàá]s|ao|com|sobre|na|no|nas|nos|da|do|das|dos)$', '', t, flags=re.IGNORECASE)
        return t[0].upper() + t[1:]

    if categoria == "medicacao":
        return "Tomar Remédio"
    elif categoria == "compromisso":
        return "Compromisso Agendado"
    else:
        return "Lembrete de Tarefa"

def _format_result(categoria: str, transcription: str, target_dt: datetime, end_dt: datetime = None, tipo_notificacao: str = 'padrao') -> dict:
    """Higieniza o título e retorna o dicionário formatado."""
    titulo = clean_concise_title(transcription, categoria)

    return {
        "categoria": categoria,
        "titulo": titulo,
        "data_hora_alvo": target_dt.strftime("%Y-%m-%dT%H:%M:%S") if target_dt else None,
        "data_hora_fim": end_dt.strftime("%Y-%m-%dT%H:%M:%S") if end_dt else None,
        "tipo_notificacao": tipo_notificacao,
        "tempo_checagem_minutos": 15
    }
