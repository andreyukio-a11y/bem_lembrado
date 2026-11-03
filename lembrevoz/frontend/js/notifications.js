/**
 * Bem Lembrado - Módulo de Sons, Notificações, Voz Ativa e Fechamento de Ciclo
 */

class SoundNotificationManager {
  constructor() {
    this.audioCtx = null;
    this.alarmInterval = null;
    this.isAlarmRunning = false;
    this.voiceFeedbackEnabled = true;
  }

  _initAudioContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
  }

  // Síntese de Voz Nativa (Text-to-Speech) em Português do Brasil
  speak(text) {
    if (!this.voiceFeedbackEnabled || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "pt-BR";
      utterance.rate = 0.95; // Ritmo calmo e legível para pessoas idosas
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
    if ("Notification" in window && Notification.permission !== "granted") {
      try {
        await Notification.requestPermission();
      } catch (e) {}
    }
  }

  notify(title, body) {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body: body,
        icon: "/icon-192.png",
        vibrate: [200, 100, 200]
      });
    }
  }
}

window.soundManager = new SoundNotificationManager();
