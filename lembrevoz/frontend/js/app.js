/**
 * Bem Lembrado - Controlador Principal da Interface v1.3
 */

// Biblioteca de Ícones SVG
const ICONS = {
  pill: `<svg viewBox="0 0 24 24"><path d="M4.22 11.29l6.36-6.36a5 5 0 017.07 7.07l-6.36 6.36a5 5 0 01-7.07-7.07zm1.42 1.42a3 3 0 004.24 4.24l2.12-2.12-4.24-4.24-2.12 2.12z"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/></svg>`,
  task: `<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`,
  clock: `<svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>`,
  trash: `<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`,
  check: `<svg viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>`,
  pin: `<svg viewBox="0 0 24 24"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/></svg>`,
  reschedule: `<svg viewBox="0 0 24 24"><path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>`,
  accessibility: `<svg viewBox="0 0 24 24"><path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z"/></svg>`,
  mic: `<svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>`,
  stop: `<svg viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg>`
};

function initApp() {
  // Elementos da Interface
  const micBtn = document.getElementById("mic-btn");
  const micWrapper = document.getElementById("mic-wrapper");
  const voiceStatus = document.getElementById("voice-status");
  const liveTranscription = document.getElementById("live-transcription");
  const cardsList = document.getElementById("cards-list");
  const btnToggleAcessivel = document.getElementById("btn-toggle-acessivel");
  const btnOpenSettings = document.getElementById("btn-open-settings");
  const settingsModal = document.getElementById("settings-modal");
  const btnCloseSettings = document.getElementById("btn-close-settings");
  const chkSettingsConforto = document.getElementById("chk-settings-conforto");
  const chkSettingsSwipe = document.getElementById("chk-settings-swipe");
  const chkSettingsTrash = document.getElementById("chk-settings-trash");
  const selectProfile = document.getElementById("select-profile");
  const profileDesc = document.getElementById("profile-desc");

  // Filtros e Seleção
  const filtersBar = document.getElementById("filters-bar");
  const countTodos = document.getElementById("count-todos");
  const btnToggleSelect = document.getElementById("btn-toggle-select");
  const batchBar = document.getElementById("batch-bar");
  const batchCount = document.getElementById("batch-count");
  const btnBatchDelete = document.getElementById("btn-batch-delete");
  const btnBatchCancel = document.getElementById("btn-batch-cancel");

  // Reagendamento
  const rescheduleModal = document.getElementById("reschedule-modal");
  const btnCloseReschedule = document.getElementById("btn-close-reschedule");
  const rescheduleItemTitle = document.getElementById("reschedule-item-title");
  const inputCustomReschedule = document.getElementById("input-custom-reschedule");
  const btnConfirmCustomReschedule = document.getElementById("btn-confirm-custom-reschedule");

  // Checagem de Remédio
  const checkModal = document.getElementById("check-modal");
  const modalMedName = document.getElementById("modal-med-name");
  const btnConfirmYes = document.getElementById("btn-confirm-yes");
  const btnConfirmNo = document.getElementById("btn-confirm-no");
  const btnSimulateAlarm = document.getElementById("btn-simulate-alarm");
  const btnManualType = document.getElementById("btn-manual-type");

  let allLoadedItems = [];
  let currentFilter = "todos";
  let isSelectionMode = false;
  let selectedItemIds = new Set();
  let activeRescheduleItemId = null;
  let activeCheckItemId = null;

  // Preferências do Usuário (Persistência em localStorage)
  let appSettings = {
    modoConforto: localStorage.getItem("bemlembrado_acessivel") === "true",
    swipeEnabled: localStorage.getItem("bemlembrado_swipe") !== "false",
    trashEnabled: localStorage.getItem("bemlembrado_trash") !== "false",
    profile: localStorage.getItem("bemlembrado_profile") || "pessoal",
    voiceFeedbackEnabled: localStorage.getItem("bemlembrado_voice") !== "false"
  };

  // 1. Aplicação das Configurações
  // --------- Relatório de Adesão ---------
  const btnOpenReport = document.getElementById('btn-open-report');
  const reportModal = document.getElementById('report-modal');
  const btnCloseReport = document.getElementById('btn-close-report');
  const btnShareReport = document.getElementById('btn-share-report');
  const reportTotal = document.getElementById('report-total');
  const reportTaken = document.getElementById('report-taken');
  const reportRate = document.getElementById('report-rate');
  const reportPending = document.getElementById('report-pending');
  const reportHistory = document.getElementById('report-history');

  function openReportModal() {
    fetch('/api/reports/adherence')
      .then(res => res.json())
      .then(data => {
        reportTotal.textContent = data.total_doses ?? '-';
        reportTaken.textContent = data.taken_doses ?? '-';
        reportRate.textContent = data.adherence_rate ? `${(data.adherence_rate*100).toFixed(1)}%` : '-';
        reportPending.textContent = data.pending_doses ?? '-';
        // Populate history list
        reportHistory.innerHTML = '';
        if (Array.isArray(data.history)) {
          data.history.forEach(entry => {
            const li = document.createElement('li');
            li.textContent = `${entry.date}: ${entry.taken ? 'Tomada' : 'Pendência'} (${entry.dose_count} doses)`;
            reportHistory.appendChild(li);
          });
        }
        if (reportModal) reportModal.style.display = 'flex';
      })
      .catch(err => console.error('Erro ao obter relatório:', err));
  }

  function closeReportModal() { if (reportModal) reportModal.style.display = 'none'; }

  function shareReport() {
    const lines = [
      'Relatório de Adesão à Medicação',
      `Total de Doses: ${reportTotal.textContent}`,
      `Doses Tomadas: ${reportTaken.textContent}`,
      `Taxa de Adesão: ${reportRate.textContent}`,
      `Doses Pendentes: ${reportPending.textContent}`,
      'Histórico:',
    ];
    reportHistory.querySelectorAll('li').forEach(li => lines.push('- ' + li.textContent));
    const text = lines.join('\n');
    // Copiar para clipboard
    navigator.clipboard.writeText(text).then(() => {
      alert('Relatório copiado para a área de transferência');
    }).catch(() => {
      alert('Não foi possível copiar o relatório');
    });
    // Abrir WhatsApp (fallback if exists)
    const encoded = encodeURIComponent(text);
    const waUrl = `https://wa.me/?text=${encoded}`;
    window.open(waUrl, '_blank');
  }

  if (btnOpenReport) btnOpenReport.addEventListener('click', openReportModal);
  if (btnCloseReport) btnCloseReport.addEventListener('click', closeReportModal);
  if (btnShareReport) btnShareReport.addEventListener('click', shareReport);

  function applySettings() {
    if (appSettings.modoConforto) {
      document.body.classList.add("modo-acessivel");
      if (chkSettingsConforto) chkSettingsConforto.checked = true;
    } else {
      document.body.classList.remove("modo-acessivel");
      if (chkSettingsConforto) chkSettingsConforto.checked = false;
    }

    if (chkSettingsSwipe) chkSettingsSwipe.checked = appSettings.swipeEnabled;
    if (chkSettingsTrash) chkSettingsTrash.checked = appSettings.trashEnabled;
    if (selectProfile) selectProfile.value = appSettings.profile;
    
    if (profileDesc) {
      if (appSettings.profile === "cuidador") {
        profileDesc.textContent = "Acompanhamento Ativo para Cuidadores / Família";
      } else if (appSettings.profile === "simplificado") {
        profileDesc.textContent = "Modo Simplificado com Ações Grandes";
      } else {
        profileDesc.textContent = "Uso Pessoal Autônomo";
      }
    }
    // Sincroniza feedback de voz com soundManager
    if (window.soundManager) {
      window.soundManager.voiceFeedbackEnabled = appSettings.voiceFeedbackEnabled;
    }
  }
  applySettings();

  // Alternador Rápido de Acessibilidade no Header
  if (btnToggleAcessivel) {
    btnToggleAcessivel.addEventListener("click", () => {
      appSettings.modoConforto = !appSettings.modoConforto;
      localStorage.setItem("bemlembrado_acessivel", appSettings.modoConforto);
      applySettings();
    });
  }

  // Abertura e Fechamento do Modal de Configurações
  if (btnOpenSettings && settingsModal) {
    btnOpenSettings.addEventListener("click", () => {
      settingsModal.style.display = "flex";
    });
  }
  if (btnCloseSettings && settingsModal) {
    btnCloseSettings.addEventListener("click", () => {
      settingsModal.style.display = "none";
    });
  }

  if (chkSettingsConforto) {
    chkSettingsConforto.addEventListener("change", (e) => {
      appSettings.modoConforto = e.target.checked;
      localStorage.setItem("bemlembrado_acessivel", appSettings.modoConforto);
      applySettings();
    });
  }
  if (chkSettingsSwipe) {
    chkSettingsSwipe.addEventListener("change", (e) => {
      appSettings.swipeEnabled = e.target.checked;
      localStorage.setItem("bemlembrado_swipe", appSettings.swipeEnabled);
      renderFeed();
    });
  }
  if (chkSettingsTrash) {
    chkSettingsTrash.addEventListener("change", (e) => {
      appSettings.trashEnabled = e.target.checked;
      localStorage.setItem("bemlembrado_trash", appSettings.trashEnabled);
      renderFeed();
    });
  }
  if (selectProfile) {
    selectProfile.addEventListener("change", (e) => {
      appSettings.profile = e.target.value;
      localStorage.setItem("bemlembrado_profile", appSettings.profile);
      applySettings();
    });
  }

  // Checkbox: Feedback de Voz
  const chkSettingsVoice = document.getElementById("chk-settings-voice");
  if (chkSettingsVoice) {
    // Inicializa estado do checkbox a partir do localStorage
    chkSettingsVoice.checked = appSettings.voiceFeedbackEnabled;
    chkSettingsVoice.addEventListener("change", (e) => {
      appSettings.voiceFeedbackEnabled = e.target.checked;
      localStorage.setItem("bemlembrado_voice", e.target.checked);
      if (window.soundManager) {
        window.soundManager.voiceFeedbackEnabled = e.target.checked;
      }
    });
  }
  // Sincroniza o soundManager com a preferência salva
  if (window.soundManager) {
    window.soundManager.voiceFeedbackEnabled = appSettings.voiceFeedbackEnabled;
  }

  // ========== SISTEMA DE ALARME AUTOMÁTICO ==========
  const alarmHandles = {};  // { itemId: { timeoutId, intervalId, attempts } }
  const ALARM_REPEAT_MS = 2 * 60 * 1000;  // 2 minutos
  const ALARM_MAX_ATTEMPTS = 5;

  function scheduleAlarm(item) {
    if (!item || !item.data_hora_alvo || item.status === "concluido" || item.confirmado_tomado) return;
    // Só agenda alarme para medicações
    if (item.categoria !== "medicacao") return;
    
    const itemId = item.id;
    // Cancela alarme anterior se houver
    stopAlarm(itemId);

    const targetTime = new Date(item.data_hora_alvo).getTime();
    const now = Date.now();
    let delay = targetTime - now;

    // Se já passou, toca imediatamente
    if (delay < 0) delay = 0;
    // Não agenda se passou há mais de 30 minutos
    if (delay === 0 && (now - targetTime) > 30 * 60 * 1000) return;

    const handle = { timeoutId: null, intervalId: null, attempts: 0 };
    
    handle.timeoutId = setTimeout(() => {
      // Primeiro toque do alarme
      triggerAlarmForItem(item, handle);
      
      // Repete a cada 2 minutos até confirmar ou max tentativas
      handle.intervalId = setInterval(() => {
        handle.attempts++;
        if (handle.attempts >= ALARM_MAX_ATTEMPTS) {
          stopAlarm(itemId);
          if (window.soundManager) {
            window.soundManager.notify("Medicação não confirmada", 
              `Você não confirmou: ${item.titulo}. Verifique seu lembrete.`);
          }
          return;
        }
        triggerAlarmForItem(item, handle);
      }, ALARM_REPEAT_MS);
    }, delay);
    
    alarmHandles[itemId] = handle;
  }

  function triggerAlarmForItem(item, handle) {
    // Toca o alarme sonoro
    if (window.soundManager) {
      window.soundManager.playPleasantChime();
      // Notificação do navegador
      window.soundManager.notify("Hora do Medicamento", 
        `Você precisa tomar: ${item.titulo}`);
      // Fala por voz (se habilitado)
      setTimeout(() => {
        if (window.soundManager && window.soundManager.voiceFeedbackEnabled) {
          window.soundManager.speak(`Hora do seu medicamento: ${item.titulo}. Você já tomou?`);
        }
      }, 600);
    }
    // Abre o modal de confirmação
    openCheckCycleModal(item.id, item.titulo);
  }

  function stopAlarm(itemId) {
    const handle = alarmHandles[itemId];
    if (handle) {
      if (handle.timeoutId) clearTimeout(handle.timeoutId);
      if (handle.intervalId) clearInterval(handle.intervalId);
      delete alarmHandles[itemId];
    }
  }

  function scheduleAllAlarms(items) {
    // Limpa todos os alarmes existentes
    Object.keys(alarmHandles).forEach(id => stopAlarm(id));
    // Agenda alarmes para itens de medicação pendentes
    items.forEach(item => {
      if (item.categoria === "medicacao" && item.status !== "concluido" && !item.confirmado_tomado) {
        scheduleAlarm(item);
      }
    });
  }
  // ========== FIM DO SISTEMA DE ALARME ==========

  // 2. Filtros de Categoria
  if (filtersBar) {
    filtersBar.querySelectorAll(".filter-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        filtersBar.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        currentFilter = pill.getAttribute("data-filter");
        renderFeed();
      });
    });
  }

  // 3. Modo de Seleção Múltipla
  if (btnToggleSelect) {
    btnToggleSelect.addEventListener("click", () => {
      isSelectionMode = !isSelectionMode;
      selectedItemIds.clear();
      updateSelectionUI();
    });
  }

  if (btnBatchCancel) {
    btnBatchCancel.addEventListener("click", () => {
      isSelectionMode = false;
      selectedItemIds.clear();
      updateSelectionUI();
    });
  }

  if (btnBatchDelete) {
    btnBatchDelete.addEventListener("click", async () => {
      if (selectedItemIds.size === 0) return;
      if (confirm(`Deseja apagar os ${selectedItemIds.size} lembretes selecionados?`)) {
        try {
          await fetch("/api/items/batch-delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ item_ids: Array.from(selectedItemIds) })
          });
          isSelectionMode = false;
          selectedItemIds.clear();
          updateSelectionUI();
          loadItems();
        } catch (e) {
          console.error("Erro na exclusão em lote:", e);
        }
      }
    });
  }

  function updateSelectionUI() {
    if (isSelectionMode) {
      document.body.classList.add("modo-selecao");
      if (btnToggleSelect) btnToggleSelect.classList.add("active");
      if (batchBar) batchBar.style.display = "flex";
      if (batchCount) batchCount.textContent = selectedItemIds.size;
    } else {
      document.body.classList.remove("modo-selecao");
      if (btnToggleSelect) btnToggleSelect.classList.remove("active");
      if (batchBar) batchBar.style.display = "none";
    }
    renderFeed();
  }

  // 4. Modal de Reagendamento
  if (btnCloseReschedule && rescheduleModal) {
    btnCloseReschedule.addEventListener("click", () => {
      rescheduleModal.style.display = "none";
    });
  }

  document.querySelectorAll(".btn-reschedule-option").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const offset = e.currentTarget.getAttribute("data-offset");
      if (!activeRescheduleItemId) return;

      const now = new Date();
      let newDate = new Date();

      if (offset === "1h") {
        newDate = new Date(now.getTime() + 60 * 60 * 1000);
      } else if (offset === "noite") {
        newDate.setHours(20, 0, 0, 0);
        if (newDate < now) newDate.setDate(newDate.getDate() + 1);
      } else if (offset === "amanha-manha") {
        newDate.setDate(now.getDate() + 1);
        newDate.setHours(8, 0, 0, 0);
      } else if (offset === "amanha-tarde") {
        newDate.setDate(now.getDate() + 1);
        newDate.setHours(14, 0, 0, 0);
      }

      const isoStr = newDate.toISOString().slice(0, 19);
      await fetch(`/api/items/${activeRescheduleItemId}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data_hora_alvo: isoStr })
      });

      rescheduleModal.style.display = "none";
      loadItems();
    });
  });

  if (btnConfirmCustomReschedule) {
    btnConfirmCustomReschedule.addEventListener("click", async () => {
      const val = inputCustomReschedule.value;
      if (!val || !activeRescheduleItemId) return;

      await fetch(`/api/items/${activeRescheduleItemId}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data_hora_alvo: val })
      });

      rescheduleModal.style.display = "none";
      loadItems();
    });
  }

  // 5. Teste Manual e Simulação de Alarme
  if (btnManualType) {
    btnManualType.addEventListener("click", () => {
      const manual = prompt("Digite seu lembrete (ex: 'Remédio de pressão às 20h' ou 'Reunião sexta às 15h'):");
      if (manual && manual.trim()) {
        processSpokenText(manual.trim());
      }
    });
  }

  if (btnSimulateAlarm) {
    btnSimulateAlarm.addEventListener("click", () => {
      openCheckCycleModal(null, "Remédio de Pressão (Simulação)");
    });
  }

  if (btnConfirmYes) {
    btnConfirmYes.addEventListener("click", async () => {
      if (window.soundManager) window.soundManager.stopContinuousAlarm();
      // Para o alarme agendado para este item
      if (activeCheckItemId) stopAlarm(activeCheckItemId);

      if (activeCheckItemId) {
        try {
          await fetch(`/api/items/${activeCheckItemId}/status`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "concluido", confirmado_tomado: true })
          });
        } catch (e) {}
      }

      if (window.soundManager) window.soundManager.playSuccessChime();
      if (checkModal) checkModal.style.display = "none";
      loadItems();
    });
  }

  if (btnConfirmNo) {
    btnConfirmNo.addEventListener("click", () => {
      if (window.soundManager) window.soundManager.stopContinuousAlarm();
      if (checkModal) checkModal.style.display = "none";
      // Não para o alarme agendado - ele voltará a tocar em 2 minutos
    });
  }

  // 6. Controlador de Voz (Microfone)
  let voice = null;
  try {
    voice = new VoiceController({
      onStart: () => {
        if (micWrapper) micWrapper.classList.add("recording");
        if (micBtn) micBtn.innerHTML = ICONS.stop;
        if (voiceStatus) voiceStatus.textContent = "Ouvindo... Toque novamente para concluir";
        if (liveTranscription) liveTranscription.textContent = "";
        if (window.soundManager) window.soundManager.requestNotificationPermission();
      },
      onProgress: (text) => {
        if (liveTranscription) liveTranscription.textContent = `"${text}"`;
      },
      onComplete: (finalText) => {
        if (micWrapper) micWrapper.classList.remove("recording");
        if (micBtn) micBtn.innerHTML = ICONS.mic;

        if (finalText && finalText.trim()) {
          processSpokenText(finalText.trim());
        } else {
          if (voiceStatus) {
            voiceStatus.textContent = "Nenhum som detectado. Toque para tentar novamente.";
            setTimeout(() => {
              voiceStatus.textContent = "Toque no microfone para falar";
            }, 3000);
          }
        }
      },
      onError: () => {
        if (micWrapper) micWrapper.classList.remove("recording");
        if (micBtn) micBtn.innerHTML = ICONS.mic;
      }
    });
  } catch (err) {}

  if (micBtn) {
    micBtn.addEventListener("click", () => {
      if (voice) voice.toggle();
      else {
        const manual = prompt("Digite seu lembrete:");
        if (manual && manual.trim()) processSpokenText(manual.trim());
      }
    });
  }

  async function processSpokenText(text) {
    if (voiceStatus) voiceStatus.textContent = "IA organizando seu lembrete...";

    try {
      const response = await fetch("/api/process-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcription: text })
      });

      const result = await response.json();
      if (result.success) {
        if (window.soundManager) window.soundManager.playSuccessChime();
        if (voiceStatus) voiceStatus.textContent = "Lembrete criado com sucesso!";
        if (liveTranscription) liveTranscription.textContent = "";
        setTimeout(() => {
          if (voiceStatus) voiceStatus.textContent = "Toque no microfone para falar";
        }, 2500);
        loadItems();
      }
    } catch (e) {
      if (voiceStatus) voiceStatus.textContent = "Erro de conexão com o servidor.";
    }
  }

  // 7. Carregar Itens do Banco de Dados
  async function loadItems() {
    try {
      const resp = await fetch("/api/items");
      allLoadedItems = await resp.json();
      if (countTodos) countTodos.textContent = `(${allLoadedItems.length})`;
      renderFeed();
      // Agenda alarmes para todas as medicações pendentes
      scheduleAllAlarms(allLoadedItems);
    } catch (e) {
      console.error("Erro ao carregar itens:", e);
    }
  }

  // 8. Renderização Inteligente em Blocos e com Filtros
  function renderFeed() {
    if (!cardsList) return;
    cardsList.innerHTML = "";

    const now = new Date();

    // Filtra itens
    let filtered = allLoadedItems.filter(item => {
      if (currentFilter === "todos") return true;
      if (currentFilter === "pendentes") {
        if (item.status === "concluido") return false;
        if (!item.data_hora_alvo) return true;
        return new Date(item.data_hora_alvo) < now;
      }
      return item.categoria === currentFilter;
    });

    if (filtered.length === 0) {
      cardsList.innerHTML = `
        <div style="text-align: center; color: var(--text-secondary); padding: 40px 12px;">
          <p style="font-size: 1.1rem; font-weight: 500; margin-bottom: 8px;">Nenhum lembrete nesta visualização.</p>
          <p style="font-size: 0.85rem;">Toque no microfone ou digite acima para adicionar.</p>
        </div>
      `;
      return;
    }

    // Classificação em Blocos:
    // 1. Fixados
    // 2. Atrasados / Pendentes
    // 3. Hoje
    // 4. Próximos Dias
    // 5. Concluídos
    const blockFixados = [];
    const blockAtrasados = [];
    const blockHoje = [];
    const blockFuturos = [];
    const blockConcluidos = [];

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    filtered.forEach(item => {
      if (item.status === "concluido") {
        blockConcluidos.push(item);
        return;
      }
      if (item.fixado) {
        blockFixados.push(item);
        return;
      }
      if (!item.data_hora_alvo) {
        blockHoje.push(item);
        return;
      }

      const itemDate = new Date(item.data_hora_alvo);
      if (itemDate < now) {
        blockAtrasados.push(item);
      } else if (itemDate <= endOfToday) {
        blockHoje.push(item);
      } else {
        blockFuturos.push(item);
      }
    });

    // Renderiza blocos com títulos
    if (blockFixados.length) {
      renderBlock("📌 Fixados no Topo", blockFixados);
    }
    if (blockAtrasados.length) {
      renderBlock("⚠️ Atrasados / Pendentes", blockAtrasados);
    }
    if (blockHoje.length) {
      renderBlock("⏰ Para Hoje", blockHoje);
    }
    if (blockFuturos.length) {
      renderBlock("📅 Próximos Dias", blockFuturos);
    }
    if (blockConcluidos.length) {
      renderBlock("✓ Concluídos", blockConcluidos);
    }

    attachCardInteractions();
  }

  function renderBlock(title, items) {
    const section = document.createElement("div");
    section.className = "feed-section-block";

    const titleEl = document.createElement("div");
    titleEl.className = "section-title";
    titleEl.textContent = title;
    section.appendChild(titleEl);

    items.forEach(item => {
      const cardEl = createCardElement(item);
      section.appendChild(cardEl);
    });

    cardsList.appendChild(section);
  }

  function createCardElement(item) {
    const now = new Date();
    const itemDate = item.data_hora_alvo ? new Date(item.data_hora_alvo) : null;
    
    // Status visual
    let statusClass = "";
    let statusBadge = "";
    if (item.status === "concluido") {
      statusClass = "concluido";
      statusBadge = `<span class="status-badge concluido">✓ Concluído</span>`;
    } else if (itemDate && itemDate < now) {
      statusClass = "atrasado";
      statusBadge = `<span class="status-badge atrasado">⚠️ Atrasado</span>`;
    } else if (itemDate && (itemDate - now) < 45 * 60 * 1000) {
      statusClass = "proximo";
      statusBadge = `<span class="status-badge proximo">⏰ Em breve</span>`;
    }

    let catIcon = ICONS.task;
    let catNome = "Tarefa";
    if (item.categoria === "medicacao") {
      catIcon = ICONS.pill;
      catNome = "Medicação";
    } else if (item.categoria === "compromisso") {
      catIcon = ICONS.calendar;
      catNome = "Compromisso";
    }

    let scheduleInfoHtml = "";
    if (itemDate) {
      const isToday = itemDate.toDateString() === now.toDateString();
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      const isTomorrow = itemDate.toDateString() === tomorrow.toDateString();

      let dayText = itemDate.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
      if (isToday) dayText = "Hoje";
      else if (isTomorrow) dayText = "Amanhã";
      else {
        const diaSemana = itemDate.toLocaleDateString([], { weekday: 'short' });
        dayText = `${diaSemana}, ${dayText}`;
      }

      const timeStr = itemDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      scheduleInfoHtml = `
        <div class="card-schedule-badge">
          <span class="schedule-time">${ICONS.clock} ${timeStr}</span>
          <span class="schedule-sep">·</span>
          <span class="schedule-date">${ICONS.calendar} ${dayText}</span>
        </div>
      `;
    }

    let doseHtml = "";
    if (item.dose) {
      doseHtml = `<span class="card-dose-tag">${item.dose}</span>`;
    }

    // Fechamento de ciclo para remédio
    let cycleHtml = "";
    if (item.categoria === "medicacao") {
      if (item.confirmado_tomado) {
        cycleHtml = `<span class="cycle-badge tomado">${ICONS.check} Tomado</span>`;
      } else {
        cycleHtml = `<button class="cycle-badge pendente btn-trigger-check" data-id="${item.id}" data-name="${item.titulo}">${ICONS.clock} Confirmar</button>`;
      }
    }

    const isChecked = selectedItemIds.has(item.id) ? "checked" : "";
    const isPinnedClass = item.fixado ? "active" : "";

    // Monta HTML do card
    const swipeContainer = document.createElement("div");
    swipeContainer.className = "card-swipe-container";
    swipeContainer.setAttribute("data-id", item.id);

    swipeContainer.innerHTML = `
      <div class="card-swipe-bg">
        ${ICONS.trash} Deslize para Apagar
      </div>
      <div class="card ${item.categoria} ${statusClass} ${item.fixado ? 'fixado' : ''}" data-id="${item.id}">
        <div class="card-top">
          <div class="card-top-left">
            <input type="checkbox" class="card-checkbox" data-id="${item.id}" ${isChecked}>
            <span class="category-tag">${catIcon} ${catNome}</span>
            ${statusBadge}
          </div>
          <div>
            ${cycleHtml}
          </div>
        </div>

        <div class="card-title">${item.titulo}</div>

        <div class="card-meta-row">
          ${scheduleInfoHtml}
          ${doseHtml}
        </div>

        ${item.transcricao_original && item.transcricao_original.toLowerCase() !== item.titulo.toLowerCase() ? `
          <div class="card-desc-box">"${item.transcricao_original}"</div>
        ` : ''}

        <div class="card-footer">
          <div></div>
          <div class="card-actions">
            ${item.status !== 'concluido' ? `<button class="btn-action btn-complete" data-id="${item.id}" title="Marcar como Concluído">${ICONS.check} Concluir</button>` : ''}
            <button class="btn-action btn-reschedule" data-id="${item.id}" data-title="${item.titulo}" title="Reagendar">${ICONS.reschedule} Reagendar</button>
            <button class="btn-action btn-pin ${isPinnedClass}" data-id="${item.id}" title="Fixar no Topo">${ICONS.pin}</button>
            ${appSettings.trashEnabled ? `<button class="btn-action btn-delete" data-id="${item.id}" title="Excluir">${ICONS.trash}</button>` : ''}
          </div>
        </div>
      </div>
    `;

    return swipeContainer;
  }

  // 9. Interações dos Cartões (Swipe, Checkbox, Botões)
  function attachCardInteractions() {
    // Checkbox de seleção
    document.querySelectorAll(".card-checkbox").forEach(chk => {
      chk.addEventListener("change", (e) => {
        const id = parseInt(e.target.getAttribute("data-id"));
        if (e.target.checked) selectedItemIds.add(id);
        else selectedItemIds.delete(id);
        if (batchCount) batchCount.textContent = selectedItemIds.size;
      });
    });

    // Ação: Concluir
    document.querySelectorAll(".btn-complete").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        await fetch(`/api/items/${id}/status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "concluido", confirmado_tomado: true })
        });
        if (window.soundManager) window.soundManager.playSuccessChime();
        loadItems();
      });
    });

    // Ação: Reagendar
    document.querySelectorAll(".btn-reschedule").forEach(btn => {
      btn.addEventListener("click", (e) => {
        activeRescheduleItemId = e.currentTarget.getAttribute("data-id");
        const title = e.currentTarget.getAttribute("data-title");
        if (rescheduleItemTitle) rescheduleItemTitle.textContent = title;
        if (rescheduleModal) rescheduleModal.style.display = "flex";
      });
    });

    // Ação: Fixar
    document.querySelectorAll(".btn-pin").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        await fetch(`/api/items/${id}/pin`, { method: "POST" });
        loadItems();
      });
    });

    // Ação: Excluir Clássica
    document.querySelectorAll(".btn-delete").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        if (confirm("Deseja apagar este lembrete?")) {
          await fetch(`/api/items/${id}`, { method: "DELETE" });
          loadItems();
        }
      });
    });

    // Ação: Confirmar Remédio (Fechamento de Ciclo)
    document.querySelectorAll(".btn-trigger-check").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        const name = e.currentTarget.getAttribute("data-name");
        openCheckCycleModal(id, name);
      });
    });

    // Gesto de Deslizar (Swipe to Delete)
    if (appSettings.swipeEnabled) {
      document.querySelectorAll(".card-swipe-container").forEach(container => {
        setupSwipeToDelete(container);
      });
    }
  }

  // Implementação Suave de Swipe to Delete (Threshold 70% + Barra de Progresso)
  function setupSwipeToDelete(container) {
    const card = container.querySelector(".card");
    const bg = container.querySelector(".card-swipe-bg");
    const id = container.getAttribute("data-id");
    let startX = 0;
    let currentX = 0;
    let isSwiping = false;
    const SWIPE_DELETE_THRESHOLD = 0.70; // 70% da largura do card

    // Eventos de Toque (Mobile)
    card.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
      isSwiping = true;
      card.style.transition = "none";
    }, { passive: true });

    card.addEventListener("touchmove", (e) => {
      if (!isSwiping) return;
      currentX = e.touches[0].clientX - startX;
      const cardWidth = card.offsetWidth;
      const progress = Math.min(Math.abs(currentX) / (cardWidth * SWIPE_DELETE_THRESHOLD), 1);
      
      // Permite deslizar para a esquerda ou direita
      if (Math.abs(currentX) > 10) {
        card.style.transform = `translateX(${currentX}px)`;
        card.style.opacity = `${1 - (progress * 0.4)}`;
        // Atualiza cor de fundo baseado no progresso
        if (bg) {
          bg.style.background = progress >= 1 
            ? "linear-gradient(135deg, #e74c3c, #c0392b)" 
            : `linear-gradient(135deg, rgba(231,76,60,${progress * 0.6}), rgba(192,57,43,${progress * 0.4}))`;
        }
      }
    }, { passive: true });

    card.addEventListener("touchend", async () => {
      if (!isSwiping) return;
      isSwiping = false;
      card.style.transition = "transform 0.25s ease-out, opacity 0.25s ease-out";

      const cardWidth = card.offsetWidth;
      const progress = Math.abs(currentX) / (cardWidth * SWIPE_DELETE_THRESHOLD);

      // Só deleta se ultrapassou 70% da largura
      if (progress >= 1) {
        card.style.transform = currentX > 0 ? "translateX(120%)" : "translateX(-120%)";
        card.style.opacity = "0";
        setTimeout(async () => {
          await fetch(`/api/items/${id}`, { method: "DELETE" });
          loadItems();
        }, 250);
      } else {
        card.style.transform = "translateX(0px)";
        card.style.opacity = "1";
        if (bg) bg.style.background = "";
      }
      currentX = 0;
    });
  }

  function openCheckCycleModal(id, medName) {
    activeCheckItemId = id;
    if (modalMedName) modalMedName.textContent = medName;
    if (checkModal) checkModal.style.display = "flex";

    if (window.soundManager) {
      window.soundManager.startContinuousAlarm(2200);
      window.soundManager.notify("Hora do Medicamento", `Você tomou: ${medName}?`);
    }
  }

  loadItems();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
