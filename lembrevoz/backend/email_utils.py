"""
Módulo de Envio de E-mails - Bem Lembrado
Suporta:
1. Resend (API HTTP gratuita, rápida e sem necessidade de senhas de app)
2. SMTP padrão (Gmail, Outlook, etc.)
"""

import os
import json
import logging
import smtplib
import urllib.request
import urllib.error
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

logger = logging.getLogger("bem_lembrado_email")
logger.setLevel(logging.INFO)

def send_welcome_email(to_email: str, name: str) -> bool:
    """
    Envia um e-mail de boas-vindas com o template visual do Bem Lembrado.
    Retorna True se enviado com sucesso ou False se falhar.
    """
    if not to_email or "@" not in to_email:
        logger.warning(f"[E-mail] E-mail de destino inválido: {to_email}")
        return False

    display_name = name.strip() if name else "Usuário"

    # 1. Carrega o template HTML
    template_path = os.path.join(os.path.dirname(__file__), "welcome_template.html")
    try:
        with open(template_path, "r", encoding="utf-8") as f:
            html_content = f.read().replace("{{name}}", display_name)
    except Exception as e:
        logger.error(f"[E-mail] Erro ao carregar template HTML: {e}")
        html_content = f"<h2>Olá, {display_name}!</h2><p>Seja bem-vindo ao Bem Lembrado! Seu cadastro foi realizado com sucesso.</p>"

    subject = "Bem-vindo ao Bem Lembrado!"

    # 2. Tenta via Resend (se RESEND_API_KEY estiver configurada)
    resend_api_key = os.getenv("RESEND_API_KEY", "").strip()
    if resend_api_key:
        # No Resend em modo de teste, 'onboarding@resend.dev' é o remetente oficial obrigatório
        from_email = os.getenv("RESEND_FROM", "").strip() or "onboarding@resend.dev"
        try:
            req = urllib.request.Request(
                "https://api.resend.com/emails",
                data=json.dumps({
                    "from": from_email,
                    "to": [to_email.strip()],
                    "subject": subject,
                    "html": html_content
                }).encode("utf-8"),
                headers={
                    "Authorization": f"Bearer {resend_api_key}",
                    "Content-Type": "application/json"
                },
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=12) as resp:
                if resp.status in (200, 201):
                    logger.info(f"[E-mail] Enviado com sucesso via Resend para {to_email}")
                    print(f"✅ [E-mail] Enviado com sucesso via Resend para {to_email}")
                    return True
        except urllib.error.HTTPError as he:
            err_body = he.read().decode('utf-8', errors='ignore')
            logger.warning(f"[E-mail Resend HTTP {he.code}]: {err_body}")
            print(f"⚠️ [E-mail Resend HTTP {he.code}]: {err_body}")
        except Exception as e:
            logger.warning(f"[E-mail] Tentativa via Resend falhou: {e}")
            print(f"⚠️ [E-mail] Falha genérica Resend: {e}")

    # 3. Tenta via SMTP (se SMTP_USERNAME e SMTP_PASSWORD estiverem configurados)
    smtp_user = os.getenv("SMTP_USERNAME", "").strip()
    smtp_pass = os.getenv("SMTP_PASSWORD", "").strip()
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com").strip()
    smtp_port = int(os.getenv("SMTP_PORT", "587"))

    if smtp_user and smtp_pass:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"Bem Lembrado <{smtp_user}>"
            msg["To"] = to_email
            msg.attach(MIMEText(html_content, "html", "utf-8"))

            with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
                server.starttls()
                server.login(smtp_user, smtp_pass)
                server.sendmail(smtp_user, [to_email], msg.as_string())

            logger.info(f"[E-mail] Enviado com sucesso via SMTP para {to_email}")
            print(f"✅ [E-mail] Enviado com sucesso via SMTP para {to_email}")
            return True
        except Exception as e:
            logger.warning(f"[E-mail] Tentativa via SMTP falhou: {e}")
            print(f"⚠️ [E-mail SMTP]: {e}")

    return False
