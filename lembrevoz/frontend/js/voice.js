/**
 * Bem Lembrado - Módulo de Captura e Reconhecimento de Voz (STT)
 */

class VoiceController {
  constructor(options = {}) {
    this.recognition = null;
    this.isRecording = false;
    this.accumulatedTranscript = "";
    this.silenceTimer = null;
    
    this.onStart = options.onStart || (() => {});
    this.onProgress = options.onProgress || (() => {});
    this.onComplete = options.onComplete || (() => {});
    this.onError = options.onError || (() => {});

    this.initRecognition();
  }

  initRecognition() {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        console.warn("Reconhecimento de fala nativo não suportado neste navegador.");
        this.isSupported = false;
        return;
      }
      this.isSupported = true;

      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

      this.recognition = new SpeechRecognition();
      this.recognition.lang = "pt-BR";
      // Apenas no WebKit do iOS o continuous=true quebra; no Android e Desktop continuous=true permite falar múltiplas frases com pausas
      this.recognition.continuous = !isIOS;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        this.isRecording = true;
        this.accumulatedTranscript = "";
        this.onStart();
      };

      this.recognition.onresult = (event) => {
        // Coleta todos os fragmentos emitidos pelo navegador
        const rawChunks = [];
        for (let i = 0; i < event.results.length; ++i) {
          const t = event.results[i][0].transcript.trim();
          if (t) rawChunks.push(t);
        }

        // Algoritmo anti-duplicação inteligente para Android e Desktop:
        const cleanPhrases = [];
        for (const chunk of rawChunks) {
          if (!cleanPhrases.length) {
            cleanPhrases.push(chunk);
          } else {
            const prev = cleanPhrases[cleanPhrases.length - 1];
            if (chunk.toLowerCase().startsWith(prev.toLowerCase())) {
              cleanPhrases[cleanPhrases.length - 1] = chunk;
            } else if (!prev.toLowerCase().endsWith(chunk.toLowerCase())) {
              cleanPhrases.push(chunk);
            }
          }
        }

        this.accumulatedTranscript = cleanPhrases.join(" ").trim();
        this.onProgress(this.accumulatedTranscript);

        // Se houver fala e 5 segundos de silêncio (ou toque manual), conclui automaticamente
        clearTimeout(this.silenceTimer);
        if (this.accumulatedTranscript.length > 3) {
          this.silenceTimer = setTimeout(() => {
            if (this.isRecording) {
              this.stop();
            }
          }, 5000);
        }
      };

      this.recognition.onerror = (event) => {
        console.warn("Status do microfone:", event.error);
        this.isRecording = false;
        clearTimeout(this.silenceTimer);
        this.onError(event.error);
      };

      this.recognition.onend = () => {
        clearTimeout(this.silenceTimer);
        const textToSend = this.accumulatedTranscript.trim();
        const wasRecording = this.isRecording;
        this.isRecording = false;

        if (wasRecording || textToSend) {
          this.onComplete(textToSend);
        }
      };
    } catch (e) {
      console.warn("Erro ao instanciar SpeechRecognition:", e);
      this.recognition = null;
      this.isSupported = false;
    }
  }

  start() {
    if (!this.recognition) {
      this._fallbackManualPrompt();
      return;
    }
    if (this.isRecording) return;

    try {
      this.accumulatedTranscript = "";
      this.recognition.start();
    } catch (e) {
      console.warn("Falha ao iniciar reconhecimento:", e);
      this.isRecording = false;
      this._fallbackManualPrompt();
    }
  }

  stop() {
    if (!this.recognition || !this.isRecording) return;
    try {
      this.recognition.stop();
    } catch (e) {
      console.warn("Erro ao parar reconhecimento:", e);
    }
  }

  toggle() {
    if (this.isRecording) {
      this.stop();
    } else {
      this.start();
    }
  }

  _fallbackManualPrompt() {
    const text = prompt("Digite seu lembrete (ex: 'Remédio de pressão às 20h'):");
    if (text && text.trim()) {
      this.onComplete(text.trim());
    }
  }
}

window.VoiceController = VoiceController;
