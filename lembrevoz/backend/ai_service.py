import os
import re
import json
import unicodedata
from datetime import datetime, timedelta, timezone

def _load_local_env():
    """Carrega variáveis de arquivos .env locais caso python-dotenv não esteja instalado."""
    try:
        from dotenv import load_dotenv
        load_dotenv()
        load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
    except ImportError:
        pass
    for env_path in [
        os.path.join(os.path.dirname(__file__), ".env"),
        os.path.join(os.path.dirname(__file__), "..", ".env"),
    ]:
        if os.path.isfile(env_path):
            try:
                with open(env_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            k = k.strip()
                            v = v.strip().strip('"').strip("'")
                            if k and not os.environ.get(k):
                                os.environ[k] = v
            except Exception:
                pass

_load_local_env()

def get_gemini_api_key() -> str:
    return os.getenv("GEMINI_API_KEY", "").strip()

GEMINI_API_KEY = get_gemini_api_key()

def norm(text: str) -> str:
    """Remove acentos e converte para minúsculas para comparações infalíveis."""
    if not text:
        return ""
    return "".join(c for c in unicodedata.normalize("NFD", text) if unicodedata.category(c) != "Mn").lower()

def clean_repetitive_text(text: str) -> str:
    """
    Higieniza repetições em camadas vindas de snapshots de voz do Android/Chrome e interjeições coloquiais.
    Exemplo: 'fazer fazer fazer atividades' -> 'fazer atividades'
    """
    if not text:
        return ""
    
    # Remove interjeições coloquiais comuns no início da fala
    text = re.sub(r'^(?:p[oô]|olha|ah|cara|bom|ent[aã]o|tipo|assim|ou|ei|veja|escuta)[\s,]+', '', text.strip(), flags=re.IGNORECASE)

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
        # Usa horário de Brasília (UTC-3) como padrão para consistência no Render (UTC)
        brt = timezone(timedelta(hours=-3))
        current_time = datetime.now(brt).replace(tzinfo=None)

    cleaned_transcription = clean_repetitive_text(transcription)

    # 1. Se houver chave do Gemini configurada, usamos a IA do Gemini
    api_key = get_gemini_api_key() or GEMINI_API_KEY
    if api_key:
        try:
            result = _call_gemini_api(cleaned_transcription, current_time, api_key=api_key)
            result["transcricao_limpa"] = cleaned_transcription
            result["ai_provider"] = result.get("ai_provider", "gemini")
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
    result["ai_provider"] = "local_rules"
    return result

def _call_gemini_api(transcription: str, current_time: datetime, api_key: str = None) -> dict:
    """Chama a API do Google Gemini usando urllib com fallback de modelos ativos."""
    import urllib.request

    active_key = api_key or get_gemini_api_key() or GEMINI_API_KEY
    models_to_try = [
        "gemini-3.5-flash",
        "gemini-3-flash-preview",
        "gemini-3.8-flash",
        "gemini-flash-latest"
    ]
    
    prompt = f"""
Você é o assistente inteligente do aplicativo 'Bem Lembrado'.
Analise o comando de voz do usuário. O usuário pode ter falado UMA ou VÁRIAS atividades/tarefas/remédios em uma única frase contínua (exemplo: "tenho uma reunião às 14h, preciso comprar pão e tomar o remédio às 18h").

ATENÇÃO CRUCIAL PARA MÚLTIPLAS DEMANDAS:
- Separe rigorosamente cada atividade individual. NUNCA misture o horário de uma atividade com o remédio ou tarefa de outra!
- Se o usuário disser "remédio para pressão às 8h e remédio para ansiedade à meia-noite", gere EXATAMENTE 2 itens:
  Item 1: titulo "Remédio de Pressão", horário 08:00 (ou do dia indicado).
  Item 2: titulo "Remédio de Ansiedade", horário 00:00 (meia-noite).

Regras de cada item:
1. 'categoria': exatamente uma destas: "medicacao", "compromisso" ou "tarefa".
2. 'titulo': Título elegante, profissional e resumido (máximo 2 a 4 palavras), no infinitivo ou substantivo.
   - NUNCA copie a fala do usuário literalmente. Transforme frases conversacionais em títulos objetivos:
     * "eu tenho que ir na casa da minha vó" -> "Visitar a Avó"
     * "fazer almoço à 1 da tarde" -> "Fazer Almoço"
     * "tenho uma atividade avaliativa" -> "Atividade Avaliativa" ou "Prova"
     * "reunião com o cliente tal" -> "Reunião de Trabalho"
     * "passar na farmácia pegar gaze" -> "Farmácia"
     * "levar o carro na oficina" -> "Oficina Mecânica"
     * "comprar pão e leite" -> "Comprar Pão e Leite"
     * "fazer caminhada no parque" -> "Caminhada"
     * "remédio do coração" -> "Remédio do Coração"
   - NUNCA inclua pronomes ("eu", "minha"), preâmbulos ("eu tenho que", "preciso", "não esquecer de", "vou", "ir na"), nem datas ou horários no título.
3. 'data_hora_alvo': Data e hora no formato ISO (YYYY-MM-DDTHH:MM:SS) de início calculadas a partir da fala (ou null se não informada).
4. 'data_hora_fim': Data e hora no formato ISO (YYYY-MM-DDTHH:MM:SS) de término quando a fala indicar um intervalo/duração (ex: "reunião das 14h às 16h", "aula das 8h às 11h") ou null.
5. 'tipo_notificacao': "alarme" (para medicamentos ou urgentes), "notificacao" (compromissos) ou "silencioso" (tarefas simples), a menos que solicitado diferente pelo usuário.
6. 'tempo_checagem_minutos': 15 para medicação.

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
    last_error = None
    for model_name in models_to_try:
        gen_config = {"temperature": 0.1}
        if model_name.startswith("gemini"):
            gen_config["responseMimeType"] = "application/json"

        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": gen_config
        }
        req_data = json.dumps(payload).encode('utf-8')
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={active_key}"
        req = urllib.request.Request(url, data=req_data, headers={"Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                if response.status == 200:
                    res_body = response.read().decode('utf-8')
                    data = json.loads(res_body)
                    raw_text = data['candidates'][0]['content']['parts'][0]['text'].strip()
                    # Remove eventuais cercas markdown ```json ... ```
                    raw_text = re.sub(r'^```(?:json)?\s*', '', raw_text, flags=re.IGNORECASE)
                    raw_text = re.sub(r'\s*```$', '', raw_text)
                    parsed = json.loads(raw_text)
                    if isinstance(parsed, list):
                        return {"itens": parsed, "ai_provider": model_name}
                    parsed["ai_provider"] = model_name
                    return parsed
        except Exception as e:
            last_error = e
            continue

    raise RuntimeError(f"Erro Gemini API: {last_error}")

def split_multiple_intents(text: str) -> list:
    """Divide um fluxo de fala contínuo com múltiplos itens em segmentos independentes com máxima precisão."""
    if not text or not text.strip():
        return []

    s = text.strip()
    # Remove interjeições no início
    s = re.sub(r'^(?:p[oô]|olha|ah|cara|bom|ent[aã]o|tipo|assim|ou|ei|veja|escuta)[\s,]+', '', s, flags=re.IGNORECASE)

    # 1. Quebras por pontuação padrão
    s = re.sub(r'\s*(?:;\s*|\.\s+)\s*', ' ||| ', s)
    
    # 2. Conectivos explícitos de sequência
    s = re.sub(
        r'\s*(?:,\s*|\s+)(?:e\s+depois|depois|em\s+seguida|al[eé]m\s+disso|e\s+tamb[eé]m|e\s+al[eé]m\s+disso|logo\s+ap[oó]s|e\s+por\s+fim)\s+',
        ' ||| ',
        s,
        flags=re.IGNORECASE
    )

    # 3. Quebras por novas orações de ação com conjunção 'e' ou 'aí' ou vírgula
    # Permite marcadores temporais com preposições opcionais antes do verbo/substantivo (ex: "e aí na sexta-feira eu tenho...", "e no domingo tenho...", "e amanhã preciso...")
    temporal_prefix = r'(?:(?:(?:na|no|em|neste|nesta|pr[oó]xim[ao])\s+)?(?:hoje|amanh[aã]|depois\s+de\s+amanh[aã]|segunda(?:-feira)?|ter[cç]a(?:-feira)?|quarta(?:-feira)?|quinta(?:-feira)?|sexta(?:-feira)?|s[aá]bado|domingo|[aàá]s?\s*\d{1,2}(?::\d{2})?(?:\s*(?:da\s+manh[aã]|da\s+tarde|da\s+noite))?)\s+)*'

    actions = r'(?:eu\s+)?(?:tenho\s+(?:que|de|um|uma)?|preciso\s+(?:de)?|vou\s+|quero\s+|lembrar\s+(?:de)?|n[aã]o\s+esquecer\s+(?:de)?|tomar\s+|beber\s+|pingar\s+|aplicar\s+|passar\s+|almo[cç]ar\s*|jantar\s*|fazer\s+|limpar\s+|lavar\s+|comprar\s+|pagar\s+|ligar\s+|buscar\s+|levar\s+|visitar\s+|caminhar\s+|estudar\s+|trabalhar\s+|dar\s+|ir\s+(?:ao?|para|na|no)?|consulta\s+|reuni[aã]o\s+|prova\s+|teste\s+|aula\s+|treino\s+|dentista\s+|m[eé]dico\s+|(?:o\s+|a\s+|um\s+|uma\s+)?(?:rem[eé]dio|medicamento|comprimido|gotas?|dose)\b)'

    s = re.sub(
        r'\s*(?:,\s*|\s+e\s+a[ií]\s+|\s+a[ií]\s+|\s+e\s+)(?=' + temporal_prefix + actions + r')\b',
        ' ||| ',
        s,
        flags=re.IGNORECASE
    )

    # 4. Quebras por novo horário introduzido por conjunção
    s = re.sub(
        r'\s+(?:e\s+|a[ií]\s+)(?=(?:[aàá]s?\s*\d{1,2}|ao\s+meio[\s-]dia|a\s+meia[\s-]noite|de\s+manh[aã]|de\s+tarde|de\s+noite|na\s+manh[aã]|na\s+tarde|na\s+noite)\b)',
        ' ||| ',
        s,
        flags=re.IGNORECASE
    )

    # 5. Quebras por indicação de outro medicamento (ex: "e de ansiedade", "e para pressão")
    s = re.sub(
        r'\s+(?:e\s+|a[ií]\s+)(?=(?:o\s+|a\s+|um\s+|uma\s+)?(?:de\s+|para\s+|pro\s+|pra\s+)?(?:ansiedade|press[aã]o|diabetes|dor|sono|dormir|colesterol|cora[cç][aã]o|est[oô]mago|tireoide|febre|gripe|calmante)\b)',
        ' ||| ',
        s,
        flags=re.IGNORECASE
    )

    # 6. Quebras automáticas quando um novo dia ou indicador temporal começa após um horário anterior (MESMO SEM 'e' ou vírgula)
    # Exemplo: "...à 1h da tarde sexta-feira tenho prova...", "...às 10h amanhã preciso..."
    temporal_starter = r'(?:(?:(?:na|no|em|neste|nesta|pr[oó]xim[ao])\s+)?(?:hoje|amanh[aã]|depois\s+de\s+amanh[aã]|segunda(?:-feira)?|ter[cç]a(?:-feira)?|quarta(?:-feira)?|quinta(?:-feira)?|sexta(?:-feira)?|s[aá]bado|domingo))\b'
    s = re.sub(
        r'(\b(?:da\s+tarde|da\s+noite|da\s+manh[aã]|da\s+madrugada|\d{1,2}h(?:\d{2})?|\d{1,2}:\d{2}|horas?))\s+(?=' + temporal_starter + r')',
        r'\1 ||| ',
        s,
        flags=re.IGNORECASE
    )

    # 7. Quebras automáticas quando uma nova ação/remédio começa após um horário anterior (MESMO SEM conectivo)
    # Exemplo: "...às 8h remédio de diabetes...", "...às 14h consulta médica..."
    s = re.sub(
        r'(\b(?:da\s+tarde|da\s+noite|da\s+manh[aã]|da\s+madrugada|\d{1,2}h(?:\d{2})?|\d{1,2}:\d{2}|horas?))\s+(?=' + actions + r')',
        r'\1 ||| ',
        s,
        flags=re.IGNORECASE
    )

    raw_parts = [p.strip() for p in s.split('|||') if p.strip()]
    cleaned_parts = []
    for p in raw_parts:
        clean_p = re.sub(r'^(?:,\s*|\s*e\s+a[ií]\s+|\s*a[ií]\s+|\s*e\s+)+', '', p, flags=re.IGNORECASE)
        clean_p = re.sub(r'[\s,]+$', '', clean_p)
        if len(clean_p) >= 3:
            cleaned_parts.append(clean_p)

    return cleaned_parts if cleaned_parts else [text.strip()]

def _rule_based_multiple_extraction(transcription: str, current_time: datetime) -> dict:
    """Extrai múltiplos itens localmente a partir de uma fala dividida."""
    intents = split_multiple_intents(transcription)

    items = []
    for piece in intents:
        item_data = _rule_based_single_extraction(piece, current_time)
        item_data["transcricao_trecho"] = piece
        items.append(item_data)

    if not items:
        item_data = _rule_based_single_extraction(transcription, current_time)
        item_data["transcricao_trecho"] = transcription
        items = [item_data]

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
        "pomada", "colirio", "injecao", "xarope", "vitamina", "inalacao",
        "ansiedade", "calmante", "colesterol", "estomago", "tireoide", "sono", "dormir",
        "dor", "febre", "gripe", "antialergico", "clonazepam", "rivotril", "fluoxetina", "sertralina"
    ]
    palavras_compromisso = [
        "medico", "consulta", "dentista", "reuniao", "encontro", "aula", 
        "visita", "visitar", "prova", "seminario", "apresentacao", "entrevista", 
        "orientador", "orientacao", "treino", "casa da", "casa do", "aniversario", 
        "festa", "missa", "culto", "banco", "cartorio", "exame", "teste"
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

        if h1 < 12 and (re.search(r'(?<!meia[-\s])\b(?:tarde|noite|da tarde|da noite)\b', text_norm) or (categoria == "compromisso" and h1 in [1, 2, 3, 4, 5, 6])):
            h1 += 12
        if h2 < 12 and (h2 <= h1 or re.search(r'(?<!meia[-\s])\b(?:tarde|noite|da tarde|da noite)\b', text_norm) or h1 >= 12):
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
    hora_match = re.search(r'\b(?:as|a)\s*(\d{1,2})(?:[h:](\d{2})?)?', text_norm)
    if hora_match:
        hour = int(hora_match.group(1))
        minute = int(hora_match.group(2)) if hora_match.group(2) else 0

        # Aplica período apenas se não for parte de 'meia-noite'
        if re.search(r'(?<!meia[-\s])\b(?:da\s+noite|da\s+tarde|a\s+noite|a\s+tarde|pela\s+tarde|pela\s+noite)\b', text_norm) and hour < 12:
            hour += 12
        elif hour in [1, 2, 3, 4, 5, 6] and not re.search(r'\b(?:da\s+manha|pela\s+manha|na\s+manha|madrugada|manha)\b', text_norm):
            hour += 12
        elif re.search(r'\b(?:manha|madrugada)\b', text_norm) and hour == 12:
            hour = 0
    else:
        # Períodos sem hora exata
        if re.search(r'\bmeio[\s-]dia\b', text_norm):
            hour, minute = 12, 0
        elif re.search(r'\bmeia[\s-]noite\b', text_norm):
            hour, minute = 0, 0
            # Meia-noite da próxima virada
            if target_date is None:
                target_date = current_time.date() + timedelta(days=1)
                has_explicit_date = True
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

        # Mapeamento semântico de condições / finalidades de remédios
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
            if re.search(cond_pat, txt_lower):
                title = cond_nome
                if dose:
                    title += f" ({dose})"
                return title

        med_match = re.search(r'\b(dipirona|losartana|paracetamol|ibuprofeno|omeprazol|atenolol|metformina|sinvastatina|clonazepam|rivotril|fluoxetina|sertralina|diazepam|insulina|antibi[oó]tico|antial[eé]rgico|vitamina\s*[a-z0-9]*|col[ií]rio|pomada)\b', txt_lower)
        if med_match:
            med = med_match.group(1).capitalize()
            title = f"Tomar {med}"
            if dose:
                title += f" ({dose})"
            return title

        if re.search(r'\b(rem[eé]dio|medica[cç][aã]o|comprimido)\b', txt_lower):
            return "Tomar Remédio"

    # 2. Para compromissos e tarefas (ou medicação genérica)
    t = txt

    # Remove termos temporais, dias da semana e datas (com e sem acento)
    patterns_to_remove = [
        r'\b(?:para|na|no|em|[aàá]s?|ao|de|pela)?\s*(?:hoje|amanh[aã]|depois\s+de\s+amanh[aã])\b',
        r'\b(?:ao|ao meio|meio)[\s-]dia\b',
        r'\b(?:a|a meia|meia)[\s-]noite\b',
        r'\b[aàá]s?\s*\d{1,2}(?:[h:]\d{2})?(?:\s*(?:da\s+tarde|da\s+noite|da\s+manh[aã]|da\s+madrugada|a\s+noite|a\s+tarde|de\s+tarde|de\s+noite|de\s+manh[aã]))?\b',
        r'\b(?:de|pela|na|a|da)?\s*(?:manh[aã]|tarde|noite|madrugada)\b',
        r'\b(?:na|no|nesta|neste|pr[oó]xim[ao])?\s*(?:segunda|ter[cç]a|quarta|quinta|sexta|s[aá]bado|domingo)(?:-feira)?\b',
        r'\b(?:das|de)\s*(?:\d{1,2}|uma|duas|tr[eê]s|quatro|cinco|seis|sete|oito|nove|dez|onze|doze)(?:[h:]\d{2})?\s*(?:[aàá]s?|at[eé]|at[eé]\s+[aàá]s?|a)\s*(?:\d{1,2}|uma|duas|tr[eê]s|quatro|cinco|seis|sete|oito|nove|dez|onze|doze)(?:[h:]\d{2})?\b',
        r'\b\d{1,2}\s*h(?:oras?)?\b',
        r'\bdaqui\s+a\s+\d+\s*(?:minutos?|horas?|dias?)\b',
        r'\bem\s+\d+\s*(?:minutos?|horas?|dias?)\b',
        r'\bpara\s+o\s+dia\s+\d{1,2}(?:\s+de\s+[a-z]+)?\b',
        r'\b(?:com alarme|urgente|sem som|silencioso|so anota|apenas anota)\b',
    ]
    for p in patterns_to_remove:
        t = re.sub(p, '', t, flags=re.IGNORECASE)

    # Remove preâmbulos e verbos introdutórios
    t = re.sub(r'^(?:eu\s+)?(?:tem(?: um| uma)?|tenho(?:\s+(?:que|de|um|uma))?|preciso(?:\s+de)?|vou|quero|lembrar(?:\s+de)?|n[aã]o\s+esquecer(?:\s+de)?|anota(?:r)?|marcar|agendar|favor)\s+', '', t.strip(), flags=re.IGNORECASE)

    # Remove artigos no início (ex: "uma reunião" -> "reunião")
    t = re.sub(r'^(?:um|uma|o|a|os|as)\s+', '', t.strip(), flags=re.IGNORECASE)

    # Remove adjetivos vazios
    t = re.sub(r'\b(importante|urgente)\b', '', t, flags=re.IGNORECASE)

    # Mapeia ações e expressões coloquiais para títulos elegantes e profissionais
    colloquial_actions = [
        (r'^(?:ir\s+(?:na|no|em|para|a|pra)\s+casa\s+d[ao]\s+)(.*)', r'Visitar \1'),
        (r'^(?:ir\s+(?:na|no|em|ao|[aà]|pra)\s+)(.*)', r'Ir a \1'),
        (r'^(?:passar\s+(?:na|no|em)\s+)(.*)', r'\1'),
        (r'^(?:fazer\s+o?\s*almo[cç]o)', r'Fazer Almoço'),
        (r'^(?:fazer\s+o?\s*jantar)', r'Fazer Jantar'),
        (r'^(?:fazer\s+o?\s*caf[eé])', r'Tomar Café'),
        (r'^(?:fazer\s+caminhada|caminhar)', r'Caminhada'),
        (r'^(?:fazer\s+compras|compras|ir\s+[aà]s\s+compras)', r'Compras'),
        (r'^(?:ir\s+(?:ao|no)\s+m[eé]dico|consulta\s+m[eé]dica)', r'Consulta Médica'),
        (r'^(?:ir\s+(?:ao|no)\s+dentista)', r'Dentista'),
        (r'^(?:atividade\s+avaliativa)', r'Atividade Avaliativa'),
        (r'^(?:fazer\s+prova|prova)', r'Prova'),
    ]
    for pat, rep in colloquial_actions:
        if re.search(pat, t, flags=re.IGNORECASE):
            t = re.sub(pat, rep, t, flags=re.IGNORECASE)
            break

    # Normaliza termos de parentesco para título profissional
    t = re.sub(r'\bminha\s+(v[oó]|av[oó])\b', 'a Avó', t, flags=re.IGNORECASE)
    t = re.sub(r'\bmeu\s+(v[oô]|av[oô])\b', 'o Avô', t, flags=re.IGNORECASE)
    t = re.sub(r'\bminha\s+m[aã]e\b', 'a Mãe', t, flags=re.IGNORECASE)
    t = re.sub(r'\bmeu\s+pai\b', 'o Pai', t, flags=re.IGNORECASE)

    # Limpa conectivos e preposições que sobraram no começo ou fim repetidamente
    for _ in range(4):
        t = re.sub(r'^(?:para|de|em|a|[aàá]s?|ao|com|sobre|na|no|nas|nos|da|do|das|dos)\s+', '', t.strip(), flags=re.IGNORECASE)
        t = re.sub(r'\s+(?:para|de|em|a|[aàá]s?|ao|com|sobre|na|no|nas|nos|da|do|das|dos)$', '', t.strip(), flags=re.IGNORECASE)
        t = re.sub(r'\s+', ' ', t).strip()

    # Se sobrou algo relevante
    if t:
        words = t.split()
        if len(words) > 7:
            t = " ".join(words[:7])
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
