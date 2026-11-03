# Guia Prático de Execução - Bem Lembrado 🚀

Este guia foi feito para que qualquer pessoa da equipe (mesmo sem experiência prévia com programação) consiga rodar, testar no celular e apresentar o protótipo.

---

## 💻 1. Como rodar no computador

1. Abra o terminal (PowerShell ou Prompt de Comando) na pasta do projeto:
   ```powershell
   cd C:\Users\Dede_\.gemini\antigravity\scratch\lembrevoz
   ```
2. Execute o servidor:
   ```powershell
   python backend/server.py
   ```
3. Abra no navegador (Google Chrome ou Edge):  
   👉 **`http://localhost:8000`**

---

## 📱 2. Como abrir no celular de qualquer um da equipe (ou na Feira)

O **Bem Lembrado** foi construído como um PWA mobile-first que se instala como um app no celular.

O endereço IP da sua máquina nesta rede Wi-Fi é:  
👉 **`http://192.168.68.107:8000`**

### Passo a passo no celular:
1. Conecte o celular na **mesma rede Wi-Fi** do seu computador.
2. No navegador do celular (Chrome no Android ou Safari no iPhone), digite o link:
   **`http://192.168.68.107:8000`**

### 🎙️ Como liberar o Microfone no celular (Regra de Segurança do Chrome):
Por padrão de segurança da internet, navegadores móveis (Chrome no Android) bloqueiam microfones em sites que não usam HTTPS (como `http://192.168...`).
Para liberar o microfone no seu celular em 20 segundos:
1. No Chrome do celular, abra uma nova aba e digite na barra de endereço:
   `chrome://flags`
2. Na barra de pesquisa que vai abrir, digite:
   `unsafely-treat-insecure-origin-as-secure`
3. Mude a opção de *Default* para **Enabled**.
4. No campo de texto que vai surgir embaixo, digite:
   `http://192.168.68.107:8000`
5. Toque no botão azul **Relaunch** (Reiniciar) no canto inferior.
6. Volte para `http://192.168.68.107:8000` e toque no microfone: agora o Chrome vai exibir a mensagem pedindo permissão e funcionará perfeitamente!

---

## 🎙️ 3. Como usar o Microfone

* **No Computador:**
  * Dê um clique no botão do microfone para **iniciar a gravação**.
  * Fale a frase naturalmente (ex: *"Remédio de pressão às 20h"* ou *"Reunião com o grupo amanhã às 14h"*).
  * Dê outro clique no botão (ou pare de falar por 3 segundos) para **concluir o envio**.
* **Atalho:** Também adicionamos o botão *"Ou digite o lembrete por texto"* para testes rápidos por teclado.

---

## 🐙 4. Como subir para o GitHub

1. Baixe e instale o Git se ainda não tiver: [git-scm.com/download/win](https://git-scm.com/download/win).
2. Crie um repositório no seu GitHub chamado `bem-lembrado`.
3. Abra o terminal na pasta do projeto e execute os comandos:
   ```bash
   cd C:\Users\Dede_\.gemini\antigravity\scratch\lembrevoz
   git init
   git add .
   git commit -m "feat: prototipo funcional Bem Lembrado com fechamento de ciclo"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/bem-lembrado.git
   git push -u origin main
   ```
4. Sempre que você aprovar novas melhorias, basta executar:
   ```bash
   git add .
   git commit -m "ajustes na interface e navegacao"
   git push
   ```
