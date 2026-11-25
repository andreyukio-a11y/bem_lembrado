/**
 * Bem Lembrado - Módulo de Sons, Notificações, Voz Ativa e Fechamento de Ciclo
 */

class SoundNotificationManager {
  constructor() {
    this.audioCtx = null;
    this.alarmInterval = null;
    this.isAlarmRunning = false;
    this.voiceFeedbackEnabled = true;
    this.speechRate = parseFloat(localStorage.getItem("bemlembrado_voice_rate")) || 0.95;
    this.swRegistration = null;
    this.initServiceWorker();
  }

  async initServiceWorker() {
    if ("serviceWorker" in navigator) {
      try {
        const reg = await navigator.serviceWorker.register("sw.js");
        this.swRegistration = reg;
        console.log("[LembreVoz SW] Registrado:", reg.scope);
        return reg;
      } catch (err) {
        console.warn("[LembreVoz SW] Erro ao registrar:", err);
      }
    }
    return null;
  }

  _initAudioContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
  }

  // Síntese de Voz Nativa (Text-to-Speech) em Português do Brasil com velocidade configurável
  speak(text, customRate = null) {
    if (!this.voiceFeedbackEnabled || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "pt-BR";
      utterance.rate = customRate || this.speechRate || 0.95; // Velocidade ajustável (0.8x lenta, 1.0x normal, 1.2x rápida)
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Erro ao sintetizar voz:", e);
    }
  }

  stopSpeech() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  // Toca um único acorde suave (plim sutil)
  playPleasantChime() {
    try {
      this._initAudioContext();
      const ctx = this.audioCtx;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc2.type = "sine";
      osc1.frequency.setValueAtTime(523.25, now);
      osc2.frequency.setValueAtTime(783.99, now + 0.12);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.exponentialRampToValueAtTime(0.25, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.6);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.9);

      if ("vibrate" in navigator) {
        navigator.vibrate([120, 80, 120]);
      }
    } catch (e) {
      console.warn("Não foi possível tocar o sino:", e);
    }
  }

  // Alarme contínuo: repete o sino suave e fala o lembrete
  startContinuousAlarm(medName = "remédio", intervalMs = 2800) {
    if (typeof medName === "number") {
      intervalMs = medName;
      medName = "remédio";
    }
    if (this.isAlarmRunning) return;
    this.isAlarmRunning = true;
    
    this.playPleasantChime();
    
    // Fala gentilmente após o primeiro toque
    setTimeout(() => {
      if (this.isAlarmRunning) {
        this.speak(`Hora do seu remédio: ${medName}. Você já tomou?`);
      }
    }, 600);

    this.alarmInterval = setInterval(() => {
      this.playPleasantChime();
    }, intervalMs);
  }

  stopContinuousAlarm() {
    this.isAlarmRunning = false;
    this.stopSpeech();
    if (this.alarmInterval) {
      clearInterval(this.alarmInterval);
      this.alarmInterval = null;
    }
  }

  // Som de confirmação alegre e congratulação por voz
  playSuccessChime() {
    try {
      this._initAudioContext();
      const ctx = this.audioCtx;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const osc3 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.frequency.setValueAtTime(523.25, now);
      osc2.frequency.setValueAtTime(659.25, now + 0.1);
      osc3.frequency.setValueAtTime(783.99, now + 0.2);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.exponentialRampToValueAtTime(0.3, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc1.connect(gain);
      osc2.connect(gain);
      osc3.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.7);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.9);
      osc3.start(now + 0.2);
      osc3.stop(now + 1.2);

      if ("vibrate" in navigator) {
        navigator.vibrate([200]);
      }
    } catch (e) {
      console.warn("Erro no som de sucesso:", e);
    }
  }

  async requestNotificationPermission() {
    if (!("Notification" in window)) return "unsupported";
    try {
      const perm = await Notification.requestPermission();
      if (perm === "granted") {
        await this.initServiceWorker();
      }
      return perm;
    } catch (e) {
      return Notification.permission;
    }
  }

  async notify(title, body, tag = "bemlembrado-alerta") {
    if (!("Notification" in window)) return;

    if (Notification.permission === "default") {
      try {
        await this.requestNotificationPermission();
      } catch (e) {}
    }

    if (Notification.permission === "granted") {
      const options = {
        body: body,
        icon: "icon-192.png",
        badge: "favicon.png",
        vibrate: [300, 150, 300, 150, 300],
        tag: tag,
        renotify: true,
        requireInteraction: true
      };

      // 1. Tenta exibir via Service Worker (obrigatório para Android Chrome e mobile)
      try {
        if ("serviceWorker" in navigator) {
          let reg = this.swRegistration || await navigator.serviceWorker.getRegistration();
          if (!reg) {
            reg = await navigator.serviceWorker.ready;
          }
          if (reg && reg.showNotification) {
            await reg.showNotification(title, options);
            return;
          }
        }
      } catch (swErr) {
        console.warn("[Notificação SW]", swErr);
      }

      // 2. Fallback para desktop se Service Worker não estiver ativo
      try {
        new Notification(title, options);
      } catch (e) {
        console.warn("[Notificação Nativa]", e);
      }
    }
  }
}

window.soundManager = new SoundNotificationManager();
