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
  stop: `<svg viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg>`,
  eye: `<svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`,
  bell: `<svg viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/></svg>`,
  alarm: `<svg viewBox="0 0 24 24"><path d="M22 5.72l-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72zM7.88 3.39L6.6 1.86 2 5.71l1.29 1.53 4.59-3.85zM12.5 8H11v6l4.75 2.85.75-1.23-4-2.37V8zM12 4c-4.97 0-9 4.03-9 9 0 4.97 4.02 9 9 9s9-4.03 9-9c0-4.97-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>`,
  alert: `<svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>`
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
  const btnManualType = document.getElementById("btn-manual-type");
  const btnDailySummary = document.getElementById("btn-daily-summary");
  const btnCaregiverShareRoutine = document.getElementById("btn-caregiver-share-routine");

  let allLoadedItems = [];
  let currentFilter = "todos";
  let isSelectionMode = false;
  let selectedItemIds = new Set();
  let activeRescheduleItemId = null;
  let activeCheckItemId = null;

  // Preferências do Usuário (Persistência em localStorage)
  let appSettings = {
    modoConforto: localStorage.getItem("bemlembrado_acessivel") === "true",
    fontSize: localStorage.getItem("bemlembrado_fontsize") || "normal",
    cuidadorPhone: localStorage.getItem("bemlembrado_cuidador_phone") || "",
    swipeEnabled: localStorage.getItem("bemlembrado_swipe") !== "false",
    trashEnabled: localStorage.getItem("bemlembrado_trash") !== "false",
    profile: localStorage.getItem("bemlembrado_profile") || "idoso",
    profileName: localStorage.getItem("bemlembrado_profile_name") || "Dona Maria",
    voiceFeedbackEnabled: localStorage.getItem("bemlembrado_voice") !== "false"
  };

  // 1. Aplicação das Configurações
  // --------- Relatório de Adesão ---------
  const btnOpenReport = document.getElementById('btn-open-report');
  const reportModal = document.getElementById('report-modal');
  const btnCloseReport = document.getElementById('btn-close-report');
  const btnShareReport = document.getElementById('btn-share-report');
  const btnCloseReportAction = document.getElementById('btn-close-report-action');
  const reportTotal = document.getElementById('report-total');
  const reportTaken = document.getElementById('report-taken');
  const reportRate = document.getElementById('report-rate');
  const reportPending = document.getElementById('report-pending');
  const reportHistory = document.getElementById('report-history');
  const adherencePercentage = document.getElementById('adherence-percentage');
  const adherenceBarFill = document.getElementById('adherence-bar-fill');
  const adherenceFeedbackMsg = document.getElementById('adherence-feedback-msg');

  function openReportModal() {
    const profileParam = activeProfile && activeProfile.id ? `?usuario_id=${encodeURIComponent(activeProfile.id)}` : '';
    fetch(`/api/reports/adherence${profileParam}`)
      .then(res => res.json())
      .then(data => {
        reportTotal.textContent = data.total_doses ?? '0';
        reportTaken.textContent = data.taken_doses ?? '0';
        const rawRate = data.adherence_rate != null ? Number(data.adherence_rate) : 0;
        const pct = Math.round(rawRate * 100);
        reportRate.textContent = `${pct}%`;
        reportPending.textContent = data.pending_doses ?? '0';

        // Atualiza Gráfico Visual de Barra
        if (adherencePercentage) {
          adherencePercentage.textContent = `${pct}%`;
          adherencePercentage.className = 'adherence-pct' + (pct >= 70 ? '' : pct >= 40 ? ' warning' : ' danger');
        }
        if (adherenceBarFill) {
          // Pequeno timeout para transição visual suave
          setTimeout(() => {
            adherenceBarFill.style.width = `${pct}%`;
            adherenceBarFill.className = 'adherence-bar-fill' + (pct >= 70 ? '' : pct >= 40 ? ' warning' : ' danger');
          }, 50);
        }
        if (adherenceFeedbackMsg) {
          if (data.total_doses === 0) {
            adherenceFeedbackMsg.textContent = 'Nenhuma medicação registrada no período ainda.';
          } else if (pct >= 80) {
            adherenceFeedbackMsg.textContent = '🌟 Excelente adesão! Todos os remédios estão sendo tomados rigorosamente nos horários.';
          } else if (pct >= 50) {
            adherenceFeedbackMsg.textContent = '⚠️ Adesão moderada. Fique atento aos avisos para não esquecer as doses.';
          } else {
            adherenceFeedbackMsg.textContent = '🚨 Adesão baixa. Lembre-se de confirmar o aviso de remédio assim que tomar.';
          }
        }

        // Populate history list
        reportHistory.innerHTML = '';
        if (Array.isArray(data.history) && data.history.length > 0) {
          data.history.forEach(entry => {
            const li = document.createElement('li');
            li.textContent = `${entry.date}: ${entry.taken ? '✅ Tomada' : '⏳ Pendência'} (${entry.dose_count} dose${entry.dose_count > 1 ? 's' : ''})`;
            reportHistory.appendChild(li);
          });
        } else {
          const li = document.createElement('li');
          li.textContent = 'Nenhum histórico recente registrado.';
          li.style.color = 'var(--text-secondary)';
          reportHistory.appendChild(li);
        }
        if (reportModal) reportModal.style.display = 'flex';
      })
      .catch(err => {
        console.error('Erro ao obter relatório:', err);
        if (reportModal) reportModal.style.display = 'flex';
      });
  }

  function closeReportModal() { 
    if (reportModal) reportModal.style.display = 'none'; 
  }

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
    navigator.clipboard.writeText(text).then(() => {
      alert('Relatório copiado para a área de transferência');
    }).catch(() => {});
    const encoded = encodeURIComponent(text);
    const waUrl = `https://wa.me/?text=${encoded}`;
    window.open(waUrl, '_blank');
  }

  if (btnOpenReport) btnOpenReport.addEventListener('click', openReportModal);
  if (btnCloseReport) btnCloseReport.addEventListener('click', closeReportModal);
  if (btnCloseReportAction) btnCloseReportAction.addEventListener('click', closeReportModal);
  if (btnShareReport) btnShareReport.addEventListener('click', shareReport);

  const selectFontSize = document.getElementById("select-font-size");
  const inputCuidadorPhone = document.getElementById("input-cuidador-phone");
  const btnUserProfile = document.getElementById("btn-user-profile");
  const profileBadgeIcon = document.getElementById("profile-badge-icon");
  const profileBadgeName = document.getElementById("profile-badge-name");
  const profileModal = document.getElementById("profile-modal");
  const btnCloseProfileModal = document.getElementById("btn-close-profile-modal");
  const caregiverBanner = document.getElementById("caregiver-banner");
  const btnCaregiverQuickMsg = document.getElementById("btn-caregiver-quick-msg");
  const btnCaregiverReport = document.getElementById("btn-caregiver-report");

  // Onboarding & Cadastro Overlay
  const onboardingOverlay = document.getElementById("onboarding-overlay");
  const onboardingStepCarousel = document.getElementById("onboarding-step-carousel");
  const onboardingStepRegister = document.getElementById("onboarding-step-register");
  const carouselSlides = document.querySelectorAll(".carousel-slide");
  const carouselDots = document.querySelectorAll(".carousel-dots .dot");
  const btnNextCarousel = document.getElementById("btn-next-carousel");
  const btnSkipCarousel = document.getElementById("btn-skip-carousel");
  const regUserName = document.getElementById("reg-user-name");
  const regDependentName = document.getElementById("reg-dependent-name");
  const regCaregiverPhone = document.getElementById("reg-caregiver-phone");
  const caregiverExtraFields = document.getElementById("caregiver-extra-fields");
  const btnSubmitRegister = document.getElementById("btn-submit-register");
  const btnCancelRegister = document.getElementById("btn-cancel-register");
  const roleChoiceCards = document.querySelectorAll(".role-choice-card");
  const profilesDynamicList = document.getElementById("profiles-dynamic-list");
  const btnAddProfileTrigger = document.getElementById("btn-add-profile-trigger");
  const btnSettingsOpenProfiles = document.getElementById("btn-settings-open-profiles");
  const optSettingsReport = document.getElementById("opt-settings-report");
  const optSettingsTutorial = document.getElementById("opt-settings-tutorial");

  function getDeviceUserId() {
    let devId = localStorage.getItem("bemlembrado_device_uid_v1");
    if (!devId) {
      devId = "u_" + Math.random().toString(36).substring(2, 9);
      localStorage.setItem("bemlembrado_device_uid_v1", devId);
    }
    return devId;
  }

  // Sistema Dinâmico de Perfis com Isolamento Exclusivo por Dispositivo
  const DEFAULT_PROFILES = [
    {
      id: getDeviceUserId(),
      name: "Dona Maria",
      role: "simplificado",
      icon: "",
      fontSize: "grande",
      dependenteName: "",
      cuidadorPhone: ""
    },
    {
      id: "cuidador_" + getDeviceUserId(),
      name: "Carlos (Cuidador)",
      role: "cuidador",
      icon: "",
      fontSize: "normal",
      dependenteName: "Dona Maria",
      cuidadorPhone: ""
    },
    {
      id: "pessoal_" + getDeviceUserId(),
      name: "Meu Perfil",
      role: "pessoal",
      icon: "",
      fontSize: "normal",
      dependenteName: "",
      cuidadorPhone: ""
    }
  ];

  function getStoredProfiles() {
    try {
      const raw = localStorage.getItem("bemlembrado_profiles_list_v3");
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr) && arr.length > 0) return arr;
      }
    } catch (e) {}
    return DEFAULT_PROFILES;
  }

  function saveStoredProfiles(list) {
    localStorage.setItem("bemlembrado_profiles_list_v3", JSON.stringify(list));
  }

  let profilesList = getStoredProfiles();
  const deviceUid = getDeviceUserId();
  // Garante que perfis genéricos 'idoso' sejam isolados exclusivamente para este aparelho
  profilesList = profilesList.map(p => {
    if (p.id === "idoso") {
      return { ...p, id: deviceUid };
    }
    return p;
  });
  saveStoredProfiles(profilesList);
  let activeProfileId = localStorage.getItem("bemlembrado_active_id_v3") || profilesList[0].id;
  let activeProfile = profilesList.find(p => p.id === activeProfileId) || profilesList[0];

  let selectedRegisterRole = "simplificado";
  let currentSlideIndex = 0;

  function applySettings() {
    // 1. Visão Conforto / Alto Contraste
    if (appSettings.modoConforto) {
      document.body.classList.add("modo-acessivel");
      if (chkSettingsConforto) chkSettingsConforto.checked = true;
    } else {
      document.body.classList.remove("modo-acessivel");
      if (chkSettingsConforto) chkSettingsConforto.checked = false;
    }

    // 2. Tamanho de Fonte (Escalabilidade na raiz html e no body)
    document.documentElement.classList.remove("font-grande", "font-extra-grande");
    document.body.classList.remove("font-grande", "font-extra-grande");
    if (appSettings.fontSize === "grande") {
      document.documentElement.classList.add("font-grande");
      document.body.classList.add("font-grande");
    } else if (appSettings.fontSize === "extra-grande") {
      document.documentElement.classList.add("font-extra-grande");
      document.body.classList.add("font-extra-grande");
    }
    if (selectFontSize) selectFontSize.value = appSettings.fontSize;
    if (inputCuidadorPhone) inputCuidadorPhone.value = activeProfile.cuidadorPhone || appSettings.cuidadorPhone;

    // 3. Diferenciação Visual do Modo
    document.body.classList.remove("modo-simplificado", "modo-cuidador", "modo-pessoal");
    if (activeProfile.role === "simplificado") {
      document.body.classList.add("modo-simplificado");
      if (voiceStatus && !voiceStatus.classList.contains("recording")) {
        voiceStatus.textContent = "Toque no microfone para falar seu lembrete";
      }
    } else if (activeProfile.role === "cuidador") {
      document.body.classList.add("modo-cuidador");
      if (voiceStatus && !voiceStatus.classList.contains("recording")) {
        voiceStatus.textContent = "Grave um lembrete ou instrução de voz";
      }
    } else {
      document.body.classList.add("modo-pessoal");
      if (voiceStatus && !voiceStatus.classList.contains("recording")) {
        voiceStatus.textContent = "Toque no microfone para falar";
      }
    }

    // 4. Header Badges
    if (profileBadgeName) profileBadgeName.textContent = activeProfile.name;
    if (profileBadgeIcon) {
      profileBadgeIcon.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`;
    }

    const settingsCurrentProfileName = document.getElementById("settings-current-profile-name");
    if (settingsCurrentProfileName) {
      settingsCurrentProfileName.textContent = activeProfile.name;
    }

    // 5. Banner do Cuidador
    if (caregiverBanner) {
      if (activeProfile.role === "cuidador") {
        caregiverBanner.style.display = "block";
        const bannerTitle = document.getElementById("caregiver-banner-title");
        if (bannerTitle) {
          const depName = activeProfile.dependenteName || localStorage.getItem("bemlembrado_dependente_name") || "Dona Maria";
          bannerTitle.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style="vertical-align: middle; margin-right: 4px;"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg> <strong>Modo Cuidador:</strong> Acompanhando ${depName}`;
        }
      } else {
        caregiverBanner.style.display = "none";
      }
    }

    if (chkSettingsSwipe) chkSettingsSwipe.checked = appSettings.swipeEnabled;
    if (chkSettingsTrash) chkSettingsTrash.checked = appSettings.trashEnabled;
    
    if (profileDesc) {
      if (activeProfile.role === "cuidador") {
        profileDesc.textContent = `Acompanhando ${activeProfile.dependenteName || 'familiar'} (Alertas & Relatórios)`;
      } else if (activeProfile.role === "simplificado") {
        profileDesc.textContent = "Visão Simplificada com Botões e Fontes Grandes";
      } else {
        profileDesc.textContent = "Uso Pessoal Autônomo";
      }
    }

    // Configurações personalizadas por Tipo de Perfil e Conta
    const grpElderCode = document.getElementById("grp-settings-elder-code");
    const grpCaregiver = document.getElementById("grp-settings-caregiver");
    const displayCareCode = document.getElementById("display-care-code");
    const displayUserEmail = document.getElementById("display-user-email");
    const careLinkStatusMsg = document.getElementById("care-link-status-msg");

    if (displayUserEmail) {
      displayUserEmail.textContent = activeProfile.email || "Perfil local (sem e-mail)";
    }

    if (activeProfile.role === "simplificado") {
      if (grpElderCode) grpElderCode.style.display = "block";
      if (grpCaregiver) grpCaregiver.style.display = "none";
      if (displayCareCode) {
        if (!activeProfile.careCode) {
          let codeNum = 1000;
          for (let i = 0; i < (activeProfile.id || "idoso").length; i++) {
            codeNum = (codeNum * 31 + activeProfile.id.charCodeAt(i)) % 9000;
          }
          activeProfile.careCode = "BL-" + (Math.abs(codeNum) + 1000);
          saveStoredProfiles(profilesList);
        }
        displayCareCode.value = activeProfile.careCode;
      }
    } else if (activeProfile.role === "cuidador") {
      if (grpElderCode) grpElderCode.style.display = "none";
      if (grpCaregiver) grpCaregiver.style.display = "block";
      if (careLinkStatusMsg) {
        careLinkStatusMsg.textContent = activeProfile.dependenteName 
          ? `✓ Atualmente acompanhando: ${activeProfile.dependenteName}`
          : "Nenhuma pessoa cuidada vinculada ainda.";
        careLinkStatusMsg.style.color = activeProfile.dependenteName ? "var(--primary)" : "var(--text-secondary)";
      }
    } else {
      if (grpElderCode) grpElderCode.style.display = "none";
      if (grpCaregiver) grpCaregiver.style.display = "none";
    }

    if (window.soundManager) {
      window.soundManager.voiceFeedbackEnabled = appSettings.voiceFeedbackEnabled;
    }
  }
  applySettings();

  // Listener para Tamanho de Fonte
  if (selectFontSize) {
    selectFontSize.addEventListener("change", (e) => {
      appSettings.fontSize = e.target.value;
      activeProfile.fontSize = e.target.value;
      localStorage.setItem("bemlembrado_fontsize", appSettings.fontSize);
      saveStoredProfiles(profilesList);
      applySettings();
    });
  }

  // Listener para Telefone do Cuidador
  if (inputCuidadorPhone) {
    inputCuidadorPhone.addEventListener("change", (e) => {
      const val = e.target.value.trim();
      appSettings.cuidadorPhone = val;
      activeProfile.cuidadorPhone = val;
      localStorage.setItem("bemlembrado_cuidador_phone", val);
      saveStoredProfiles(profilesList);
    });
  }

  // Renderiza Lista Dinâmica de Perfis
  function renderProfilesModalList() {
    if (!profilesDynamicList) return;
    profilesDynamicList.innerHTML = "";

    profilesList.forEach(p => {
      const row = document.createElement("div");
      const isActive = p.id === activeProfile.id;
      row.className = `profile-card-row ${isActive ? 'active' : ''}`;
      
      let roleDesc = "Uso Pessoal";
      if (p.role === "simplificado") roleDesc = "Modo Simplificado / Idoso";
      else if (p.role === "cuidador") roleDesc = `Cuidador (Acompanhando ${p.dependenteName || 'Dona Maria'})`;

      row.innerHTML = `
        <div class="profile-card-left" data-id="${p.id}">
          <span class="profile-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          </span>
          <div class="profile-info">
            <strong>${p.name} ${isActive ? '<span style="color: var(--primary); font-size: 0.8rem; font-weight: 800;">(Ativo)</span>' : ''}</strong>
            <small>${roleDesc}</small>
          </div>
        </div>
        <div class="profile-card-actions">
          ${profilesList.length > 1 ? `<button class="btn-delete-profile" data-id="${p.id}" title="Excluir Perfil"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg></button>` : ''}
        </div>
      `;

      row.querySelector(".profile-card-left").addEventListener("click", () => {
        switchActiveProfile(p.id);
        if (profileModal) profileModal.style.display = "none";
      });

      const delBtn = row.querySelector(".btn-delete-profile");
      if (delBtn) {
        delBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (confirm(`Deseja excluir o perfil "${p.name}"?`)) {
            deleteProfile(p.id);
          }
        });
      }

      profilesDynamicList.appendChild(row);
    });
  }

  function switchActiveProfile(pId) {
    const found = profilesList.find(p => p.id === pId);
    if (!found) return;
    activeProfile = found;
    activeProfileId = found.id;
    localStorage.setItem("bemlembrado_active_id_v3", found.id);
    if (found.fontSize) {
      appSettings.fontSize = found.fontSize;
      localStorage.setItem("bemlembrado_fontsize", found.fontSize);
    }
    applySettings();
    renderProfilesModalList();
    loadItems();
  }

  function deleteProfile(pId) {
    if (profilesList.length <= 1) return;
    profilesList = profilesList.filter(p => p.id !== pId);
    saveStoredProfiles(profilesList);
    if (activeProfile.id === pId) {
      activeProfile = profilesList[0];
      activeProfileId = activeProfile.id;
      localStorage.setItem("bemlembrado_active_id_v3", activeProfile.id);
    }
    applySettings();
    renderProfilesModalList();
    loadItems();
  }

  // Abertura e Fechamento do Modal de Perfil
  if (btnUserProfile && profileModal) {
    btnUserProfile.addEventListener("click", () => {
      renderProfilesModalList();
      profileModal.style.display = "flex";
    });
  }
  if (btnCloseProfileModal && profileModal) {
    btnCloseProfileModal.addEventListener("click", () => {
      profileModal.style.display = "none";
    });
  }

  // Abertura do Gerenciador de Perfis a partir das Configurações
  if (btnSettingsOpenProfiles && profileModal) {
    btnSettingsOpenProfiles.addEventListener("click", () => {
      if (settingsModal) settingsModal.style.display = "none";
      renderProfilesModalList();
      profileModal.style.display = "flex";
    });
  }

  // Botões de Relatório e Tutorial nas Configurações e Cuidador
  if (optSettingsReport) {
    optSettingsReport.addEventListener("click", () => {
      if (settingsModal) settingsModal.style.display = "none";
      openReportModal();
    });
  }
  if (optSettingsTutorial) {
    optSettingsTutorial.addEventListener("click", () => {
      if (settingsModal) settingsModal.style.display = "none";
      openOnboardingCarousel();
    });
  }
  if (btnCaregiverReport) {
    btnCaregiverReport.addEventListener("click", openReportModal);
  }

  // Carrossel e Onboarding
  function showSlide(index) {
    currentSlideIndex = index;
    carouselSlides.forEach((slide, i) => {
      slide.classList.toggle("active", i === index);
    });
    carouselDots.forEach((dot, i) => {
      dot.classList.toggle("active", i === index);
    });

    if (btnNextCarousel) {
      if (currentSlideIndex === carouselSlides.length - 1) {
        btnNextCarousel.textContent = "Criar Perfil e Começar ➔";
      } else {
        btnNextCarousel.textContent = "Avançar ➔";
      }
    }
  }

  if (btnNextCarousel) {
    btnNextCarousel.addEventListener("click", () => {
      if (currentSlideIndex < carouselSlides.length - 1) {
        showSlide(currentSlideIndex + 1);
      } else {
        openRegistrationStep(false);
      }
    });
  }

  if (btnSkipCarousel) {
    btnSkipCarousel.addEventListener("click", () => {
      openRegistrationStep(false);
    });
  }

  carouselDots.forEach(dot => {
    dot.addEventListener("click", () => {
      const idx = parseInt(dot.getAttribute("data-dot"), 10);
      showSlide(idx);
    });
  });

  function openOnboardingCarousel() {
    if (!onboardingOverlay) return;
    onboardingOverlay.style.display = "flex";
    if (onboardingStepCarousel) onboardingStepCarousel.style.display = "flex";
    if (onboardingStepRegister) onboardingStepRegister.style.display = "none";
    showSlide(0);
  }

  function openRegistrationStep(isNewAdditional = false) {
    if (!onboardingOverlay) return;
    onboardingOverlay.style.display = "flex";
    if (onboardingStepCarousel) onboardingStepCarousel.style.display = "none";
    if (onboardingStepRegister) onboardingStepRegister.style.display = "flex";

    if (regUserName) regUserName.value = "";
    if (regDependentName) regDependentName.value = "";
    if (regCaregiverPhone) regCaregiverPhone.value = "";
    
    selectedRegisterRole = "simplificado";
    roleChoiceCards.forEach(c => c.classList.toggle("selected", c.getAttribute("data-role") === "simplificado"));
    if (caregiverExtraFields) caregiverExtraFields.style.display = "none";

    const regTitle = document.getElementById("register-title");
    if (regTitle) {
      regTitle.textContent = isNewAdditional ? "Cadastrar Novo Perfil" : "Criar Meu Perfil";
    }

    if (btnCancelRegister) {
      btnCancelRegister.style.display = isNewAdditional ? "block" : "none";
    }
  }

  roleChoiceCards.forEach(card => {
    card.addEventListener("click", () => {
      roleChoiceCards.forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      selectedRegisterRole = card.getAttribute("data-role");

      if (caregiverExtraFields) {
        caregiverExtraFields.style.display = selectedRegisterRole === "cuidador" ? "block" : "none";
      }
    });
  });

  if (btnCancelRegister) {
    btnCancelRegister.addEventListener("click", () => {
      if (onboardingOverlay) onboardingOverlay.style.display = "none";
    });
  }

  // Helper para formatar links do WhatsApp com ou sem código 55
  function formatWhatsAppUrl(rawPhone, text) {
    const cleanPhone = (rawPhone || "").replace(/\D/g, "");
    const encoded = encodeURIComponent(text);
    if (!cleanPhone) return `https://wa.me/?text=${encoded}`;
    const fullPhone = cleanPhone.startsWith("55") && cleanPhone.length >= 12 ? cleanPhone : `55${cleanPhone}`;
    return `https://wa.me/${fullPhone}?text=${encoded}`;
  }

  // Abas de Autenticação (Criar Conta vs Entrar)
  const tabAuthRegister = document.getElementById("tab-auth-register");
  const tabAuthLogin = document.getElementById("tab-auth-login");
  const authRegisterPanel = document.getElementById("auth-register-panel");
  const authLoginPanel = document.getElementById("auth-login-panel");
  const regUserEmail = document.getElementById("reg-user-email");
  const regUserPassword = document.getElementById("reg-user-password");
  const regUserPurpose = document.getElementById("reg-user-purpose");
  const loginEmail = document.getElementById("login-email");
  const loginPassword = document.getElementById("login-password");
  const btnSubmitLogin = document.getElementById("btn-submit-login");
  const btnCancelLogin = document.getElementById("btn-cancel-login");
  const registerErrorMsg = document.getElementById("register-error-msg");
  const loginErrorMsg = document.getElementById("login-error-msg");

  if (tabAuthRegister && tabAuthLogin) {
    tabAuthRegister.addEventListener("click", () => {
      tabAuthRegister.classList.add("active");
      tabAuthLogin.classList.remove("active");
      if (authRegisterPanel) authRegisterPanel.style.display = "block";
      if (authLoginPanel) authLoginPanel.style.display = "none";
    });
    tabAuthLogin.addEventListener("click", () => {
      tabAuthLogin.classList.add("active");
      tabAuthRegister.classList.remove("active");
      if (authLoginPanel) authLoginPanel.style.display = "block";
      if (authRegisterPanel) authRegisterPanel.style.display = "none";
      if (btnCancelLogin && btnCancelRegister) {
        btnCancelLogin.style.display = btnCancelRegister.style.display;
      }
    });
  }

  if (btnCancelLogin) {
    btnCancelLogin.addEventListener("click", () => {
      if (onboardingOverlay) onboardingOverlay.style.display = "none";
    });
  }

  function activateUserProfileFromAuth(userObj) {
    let icon = "👤";
    if (userObj.role === "simplificado") icon = "👵";
    else if (userObj.role === "cuidador") icon = "🩺";

    const fontSize = userObj.font_size || (userObj.role === "simplificado" ? "grande" : "normal");
    const newProfile = {
      id: userObj.id,
      name: userObj.name,
      email: userObj.email || "",
      role: userObj.role || "simplificado",
      purpose: userObj.purpose || "rotina_e_remedios",
      icon: icon,
      fontSize: fontSize,
      dependenteName: userObj.dependente_name || "",
      cuidadorPhone: userObj.phone || ""
    };

    const existingIdx = profilesList.findIndex(p => p.id === newProfile.id || (newProfile.email && p.email === newProfile.email));
    if (existingIdx >= 0) {
      profilesList[existingIdx] = newProfile;
    } else {
      profilesList.push(newProfile);
    }
    saveStoredProfiles(profilesList);
    activeProfile = newProfile;
    activeProfileId = newProfile.id;
    localStorage.setItem("bemlembrado_active_id_v3", newProfile.id);
    localStorage.setItem("bemlembrado_onboarded_v3", "true");

    if (newProfile.cuidadorPhone) {
      appSettings.cuidadorPhone = newProfile.cuidadorPhone;
      localStorage.setItem("bemlembrado_cuidador_phone", newProfile.cuidadorPhone);
    }
    appSettings.fontSize = fontSize;
    localStorage.setItem("bemlembrado_fontsize", fontSize);

    if (onboardingOverlay) onboardingOverlay.style.display = "none";
    applySettings();
    renderProfilesModalList();
    loadItems();
  }

  if (btnSubmitLogin) {
    btnSubmitLogin.addEventListener("click", async () => {
      if (loginErrorMsg) loginErrorMsg.style.display = "none";
      const email = loginEmail ? loginEmail.value.trim() : "";
      const password = loginPassword ? loginPassword.value : "";

      if (!email || !password) {
        if (loginErrorMsg) {
          loginErrorMsg.textContent = "Preencha seu e-mail e senha para entrar.";
          loginErrorMsg.style.display = "block";
        }
        return;
      }

      btnSubmitLogin.disabled = true;
      btnSubmitLogin.textContent = "Entrando...";
      try {
        const resp = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        const data = await resp.json();
        if (!resp.ok) {
          throw new Error(data.detail || "E-mail ou senha incorretos.");
        }
        activateUserProfileFromAuth(data.user);
      } catch (err) {
        if (loginErrorMsg) {
          loginErrorMsg.textContent = err.message;
          loginErrorMsg.style.display = "block";
        }
      } finally {
        btnSubmitLogin.disabled = false;
        btnSubmitLogin.textContent = "🔓 Entrar";
      }
    });
  }

  if (btnSubmitRegister) {
    btnSubmitRegister.addEventListener("click", async () => {
      if (registerErrorMsg) registerErrorMsg.style.display = "none";
      const typedName = regUserName ? regUserName.value.trim() : "";
      const emailVal = regUserEmail ? regUserEmail.value.trim() : "";
      const passVal = regUserPassword ? regUserPassword.value : "";
      const purposeVal = regUserPurpose ? regUserPurpose.value : "rotina_e_remedios";
      const depName = regDependentName ? regDependentName.value.trim() : "";
      const zapPhone = regCaregiverPhone ? regCaregiverPhone.value.trim() : "";

      if (!typedName || !emailVal || !passVal) {
        if (registerErrorMsg) {
          registerErrorMsg.textContent = "Preencha nome, e-mail e senha (mínimo 4 caracteres).";
          registerErrorMsg.style.display = "block";
        }
        return;
      }

      btnSubmitRegister.disabled = true;
      btnSubmitRegister.textContent = "Criando conta...";
      try {
        const resp = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: typedName,
            email: emailVal,
            password: passVal,
            role: selectedRegisterRole,
            purpose: purposeVal,
            phone: zapPhone,
            dependente_name: depName
          })
        });
        const data = await resp.json();
        if (!resp.ok) {
          throw new Error(data.detail || "Erro ao criar conta.");
        }
        activateUserProfileFromAuth(data.user);
      } catch (err) {
        if (registerErrorMsg) {
          registerErrorMsg.textContent = err.message;
          registerErrorMsg.style.display = "block";
        }
      } finally {
        btnSubmitRegister.disabled = false;
        btnSubmitRegister.textContent = "🚀 Criar Conta e Começar";
      }
    });
  }

  if (btnAddProfileTrigger) {
    btnAddProfileTrigger.addEventListener("click", () => {
      if (profileModal) profileModal.style.display = "none";
      openRegistrationStep(true);
    });
  }

  // Verificação inicial se deve exibir onboarding
  const hasOnboarded = localStorage.getItem("bemlembrado_onboarded_v3");
  if (!hasOnboarded) {
    openOnboardingCarousel();
  }

  // Botão rápido de WhatsApp no Banner do Cuidador
  if (btnCaregiverQuickMsg) {
    btnCaregiverQuickMsg.addEventListener("click", () => {
      const phone = activeProfile.cuidadorPhone || appSettings.cuidadorPhone || "";
      const dep = activeProfile.dependenteName || "seu familiar";
      const zapUrl = formatWhatsAppUrl(phone, `Olá! Como estão as atividades e medicações de ${dep} hoje?`);
      window.open(zapUrl, "_blank");
    });
  }

  // Botão rápido para Enviar Rotina Completa no WhatsApp
  if (btnCaregiverShareRoutine) {
    btnCaregiverShareRoutine.addEventListener("click", () => {
      const dep = activeProfile.dependenteName || activeProfile.name || "Dona Maria";
      const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
      let msg = `📋 *Rotina do Dia - ${dep}*\n🗓️ ${today}\n\n`;

      const meds = allLoadedItems.filter(i => i.categoria === 'medicacao' || i.tipo_notificacao === 'alarme');
      const tasks = allLoadedItems.filter(i => i.categoria !== 'medicacao' && i.tipo_notificacao !== 'alarme');

      msg += `💊 *MEDICAÇÕES:*\n`;
      if (meds.length === 0) {
        msg += `• Nenhuma medicação agendada.\n`;
      } else {
        meds.forEach(m => {
          const hora = m.data_hora_alvo ? new Date(m.data_hora_alvo).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Horário livre';
          const status = (m.status === 'concluido' || m.confirmado_tomado) ? '✅ Tomado' : '⏳ Pendente';
          msg += `• [${hora}] ${m.titulo} (${status})\n`;
        });
      }

      msg += `\n📌 *ATIVIDADES E TAREFAS:*\n`;
      if (tasks.length === 0) {
        msg += `• Nenhuma atividade agendada.\n`;
      } else {
        tasks.forEach(t => {
          const hora = t.data_hora_alvo ? new Date(t.data_hora_alvo).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Horário livre';
          const status = t.status === 'concluido' ? '✅ Concluído' : '⏳ Pendente';
          msg += `• [${hora}] ${t.titulo} (${status})\n`;
        });
      }

      msg += `\nEnviado via *Bem Lembrado* 👵✨`;
      const phone = activeProfile.cuidadorPhone || appSettings.cuidadorPhone || "";
      const zapUrl = formatWhatsAppUrl(phone, msg);
      window.open(zapUrl, "_blank");
    });
  }

  // Botão "Ouvir meu dia" (Resumo Diário por Voz)
  if (btnDailySummary) {
    btnDailySummary.addEventListener("click", () => {
      if (!allLoadedItems || allLoadedItems.length === 0) {
        if (window.soundManager) {
          window.soundManager.speak("Você não tem nenhum lembrete ou remédio agendado no momento. Seu dia está livre!");
        }
        return;
      }

      const todayStr = new Date().toISOString().slice(0, 10);
      const todayPending = allLoadedItems.filter(item => {
        if (item.status === 'concluido') return false;
        if (!item.data_hora_alvo) return true;
        return item.data_hora_alvo.startsWith(todayStr) || new Date(item.data_hora_alvo) <= new Date();
      });

      if (todayPending.length === 0) {
        if (window.soundManager) {
          window.soundManager.speak("Parabéns! Todas as suas atividades e remédios de hoje já foram concluídos.");
        }
        return;
      }

      const meds = todayPending.filter(i => i.tipo === 'remedio' || i.tipo_notificacao === 'alarme');
      const tasks = todayPending.filter(i => i.tipo !== 'remedio' && i.tipo_notificacao !== 'alarme');

      let speech = "Aqui está o resumo do seu dia. ";
      if (meds.length > 0) {
        speech += `Você tem ${meds.length} ${meds.length === 1 ? 'remédio pendente' : 'remédios pendentes'}: `;
        meds.forEach(m => {
          let hora = "";
          if (m.data_hora_alvo) {
            const d = new Date(m.data_hora_alvo);
            hora = ` às ${d.getHours()} horas${d.getMinutes() > 0 ? ' e ' + d.getMinutes() + ' minutos' : ''}`;
          }
          speech += `${m.titulo}${hora}. `;
        });
      }
      if (tasks.length > 0) {
        speech += `E você tem ${tasks.length} ${tasks.length === 1 ? 'atividade' : 'atividades'}: `;
        tasks.forEach(t => {
          let hora = "";
          if (t.data_hora_alvo) {
            const d = new Date(t.data_hora_alvo);
            hora = ` às ${d.getHours()} horas${d.getMinutes() > 0 ? ' e ' + d.getMinutes() + ' minutos' : ''}`;
          }
          speech += `${t.titulo}${hora}. `;
        });
      }
      speech += "Tenha um ótimo dia!";

      if (window.soundManager) {
        window.soundManager.speak(speech);
      }
    });
  }

  // Modal de Escalação de Cuidador
  const escalationModal = document.getElementById("escalation-modal");
  const escalationMedName = document.getElementById("escalation-med-name");
  const btnEscalateZap = document.getElementById("btn-escalate-zap");
  const btnEscalateDismiss = document.getElementById("btn-escalate-dismiss");
  let activeEscalationItem = null;

  // Modal de Seleção de Tipo de Notificação
  const notifTypeModal = document.getElementById("notif-type-modal");
  const btnCloseNotifModal = document.getElementById("btn-close-notif-modal");
  const notifModalItemTitle = document.getElementById("notif-modal-item-title");
  let activeNotifItemId = null;

  function openEscalationModal(item) {
    activeEscalationItem = item;
    if (escalationMedName) escalationMedName.textContent = item.titulo;
    if (escalationModal) escalationModal.style.display = "flex";
    if (window.soundManager) window.soundManager.speak(`Atenção. O lembrete de ${item.titulo} não foi confirmado.`);
  }

  if (btnEscalateDismiss && escalationModal) {
    btnEscalateDismiss.addEventListener("click", () => {
      escalationModal.style.display = "none";
    });
  }

  if (btnEscalateZap && escalationModal) {
    btnEscalateZap.addEventListener("click", () => {
      const phone = appSettings.cuidadorPhone ? appSettings.cuidadorPhone.replace(/\D/g, '') : '';
      const med = activeEscalationItem ? activeEscalationItem.titulo : 'a medicação';
      const text = encodeURIComponent(`Atenção: O lembrete de "${med}" não foi confirmado por Dona Maria. Por favor, verifique com ela.`);
      const zapUrl = phone ? `https://wa.me/55${phone}?text=${text}` : `https://wa.me/?text=${text}`;
      window.open(zapUrl, "_blank");
      escalationModal.style.display = "none";
    });
  }

  // Modal de Tipo de Notificação
  if (btnCloseNotifModal && notifTypeModal) {
    btnCloseNotifModal.addEventListener("click", () => {
      notifTypeModal.style.display = "none";
    });
  }

  document.querySelectorAll(".btn-notif-choice").forEach(btn => {
    btn.addEventListener("click", async () => {
      const newType = btn.getAttribute("data-type");
      if (activeNotifItemId && newType) {
        try {
          await fetch(`/api/items/${activeNotifItemId}/notification`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tipo_notificacao: newType })
          });
          if (notifTypeModal) notifTypeModal.style.display = "none";
          loadItems();
        } catch (e) {
          console.error("Erro ao alterar tipo de notificação:", e);
        }
      }
    });
  });

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
      // Ajusta as seções visíveis conforme o perfil
      const isCaregiver = activeProfile.role === "cuidador";
      const grpCaregiver = document.getElementById("grp-settings-caregiver");
      const grpDeletion = document.getElementById("grp-settings-deletion");
      const optReport = document.getElementById("opt-settings-report");

      if (grpCaregiver) grpCaregiver.style.display = isCaregiver ? "block" : "none";
      if (grpDeletion) grpDeletion.style.display = isCaregiver ? "block" : "none";
      if (optReport) optReport.style.display = isCaregiver ? "flex" : "none";

      const inputCuidadorDependente = document.getElementById("input-cuidador-dependente");
      if (inputCuidadorDependente) {
        inputCuidadorDependente.value = activeProfile.dependenteName || localStorage.getItem("bemlembrado_dependente_name") || "Dona Maria";
      }
      if (inputCuidadorPhone) {
        inputCuidadorPhone.value = activeProfile.cuidadorPhone || appSettings.cuidadorPhone || localStorage.getItem("bemlembrado_cuidador_phone") || "";
      }

      settingsModal.style.display = "flex";
    });
  }
  if (btnCloseSettings && settingsModal) {
    btnCloseSettings.addEventListener("click", () => {
      settingsModal.style.display = "none";
    });
  }

  const btnSaveCaregiverLink = document.getElementById("btn-save-caregiver-link");
  if (btnSaveCaregiverLink) {
    btnSaveCaregiverLink.addEventListener("click", () => {
      const phone = inputCuidadorPhone ? inputCuidadorPhone.value.trim() : "";
      if (phone) {
        activeProfile.cuidadorPhone = phone;
        appSettings.cuidadorPhone = phone;
        localStorage.setItem("bemlembrado_cuidador_phone", phone);
        saveStoredProfiles(profilesList);
        alert("Número de WhatsApp salvo com sucesso!");
      }
    });
  }

  // Copiar código de cuidado da pessoa idosa
  const btnCopyCareCode = document.getElementById("btn-copy-care-code");
  if (btnCopyCareCode) {
    btnCopyCareCode.addEventListener("click", () => {
      const codeInput = document.getElementById("display-care-code");
      if (codeInput) {
        navigator.clipboard.writeText(codeInput.value).then(() => {
          btnCopyCareCode.textContent = "Copiado!";
          setTimeout(() => { btnCopyCareCode.textContent = "Copiar"; }, 2000);
        }).catch(() => {
          codeInput.select();
          document.execCommand("copy");
          btnCopyCareCode.textContent = "Copiado!";
          setTimeout(() => { btnCopyCareCode.textContent = "Copiar"; }, 2000);
        });
      }
    });
  }

  // Vincular pessoa cuidada por código (ID) no perfil Cuidador
  const btnLinkByCareCode = document.getElementById("btn-link-by-care-code");
  if (btnLinkByCareCode) {
    btnLinkByCareCode.addEventListener("click", async () => {
      const inputCode = document.getElementById("input-care-code-link");
      const msgElem = document.getElementById("care-link-status-msg");
      const codeVal = inputCode ? inputCode.value.trim().toUpperCase() : "";
      if (!codeVal) {
        alert("Por favor, digite o código de vínculo (ex: BL-1234).");
        return;
      }
      btnLinkByCareCode.textContent = "Vinculando...";
      try {
        const cleanCode = codeVal.replace(/[^A-Z0-9]/gi, "").toUpperCase();
        let targetDepName = "";
        let targetDepId = "";

        // 1. Tenta vincular via API no servidor
        try {
          const resp = await fetch("/api/user/link-care", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: activeProfile.id, care_code: codeVal })
          });
          const resData = await resp.json();
          if (resp.ok && resData.success) {
            targetDepName = resData.dependente_name;
            targetDepId = resData.dependente_id;
          }
        } catch (apiErr) {
          console.warn("[LinkCare] API error, tentando busca local:", apiErr);
        }

        // 2. Se não achou na API ou está em perfil local, busca na lista de perfis do dispositivo
        if (!targetDepName) {
          const localMatch = profilesList.find(p => {
            const pCode = (p.careCode || "").replace(/[^A-Z0-9]/gi, "").toUpperCase();
            return pCode === cleanCode || pCode.endsWith(cleanCode) || cleanCode.endsWith(pCode);
          });
          if (localMatch) {
            targetDepName = localMatch.name;
            targetDepId = localMatch.id;
          }
        }

        if (!targetDepName) {
          throw new Error(`Nenhum perfil encontrado com o código '${codeVal}'. Verifique no perfil da pessoa cuidada.`);
        }

        activeProfile.dependenteName = targetDepName;
        activeProfile.dependenteId = targetDepId;
        activeProfile.linkedCareCode = codeVal;
        localStorage.setItem("bemlembrado_dependente_name", targetDepName);
        saveStoredProfiles(profilesList);
        applySettings();
        loadItems();
        if (msgElem) {
          msgElem.textContent = `✓ Vinculado com sucesso a ${targetDepName}!`;
          msgElem.style.color = "var(--primary)";
        }
        alert(`Vínculo realizado com sucesso com ${targetDepName}!`);
      } catch (err) {
        if (msgElem) {
          msgElem.textContent = err.message;
          msgElem.style.color = "#ef4444";
        }
        alert(err.message);
      } finally {
        btnLinkByCareCode.textContent = "Vincular";
      }
    });
  }

  // Alterar Senha de Acesso
  const btnToggleChangePw = document.getElementById("btn-toggle-change-password");
  const boxChangePw = document.getElementById("box-change-password");
  if (btnToggleChangePw && boxChangePw) {
    btnToggleChangePw.addEventListener("click", () => {
      boxChangePw.style.display = boxChangePw.style.display === "none" ? "flex" : "none";
    });
  }

  const btnSaveNewPw = document.getElementById("btn-save-new-password");
  if (btnSaveNewPw) {
    btnSaveNewPw.addEventListener("click", async () => {
      const currPw = document.getElementById("input-current-password")?.value || "";
      const newPw = document.getElementById("input-new-password")?.value || "";
      const msgElem = document.getElementById("change-password-msg");

      if (!currPw || !newPw) {
        alert("Preencha a senha atual e a nova senha.");
        return;
      }
      btnSaveNewPw.textContent = "Salvando...";
      try {
        const resp = await fetch("/api/user/change-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: activeProfile.id,
            current_password: currPw,
            new_password: newPw
          })
        });
        const resData = await resp.json();
        if (!resp.ok) throw new Error(resData.detail || "Erro ao alterar senha.");
        if (msgElem) {
          msgElem.textContent = "Senha alterada com sucesso!";
          msgElem.style.color = "var(--primary)";
        }
        alert("Senha alterada com sucesso!");
        if (boxChangePw) boxChangePw.style.display = "none";
      } catch (err) {
        if (msgElem) {
          msgElem.textContent = err.message;
          msgElem.style.color = "#ef4444";
        }
        alert(err.message);
      } finally {
        btnSaveNewPw.textContent = "Salvar Nova Senha";
      }
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

  // Velocidade da Fala (TTS)
  const selectVoiceSpeed = document.getElementById("select-voice-speed");
  const savedVoiceRate = localStorage.getItem("bemlembrado_voice_rate") || "0.95";
  if (selectVoiceSpeed) {
    selectVoiceSpeed.value = savedVoiceRate;
    selectVoiceSpeed.addEventListener("change", (e) => {
      const rate = parseFloat(e.target.value) || 0.95;
      localStorage.setItem("bemlembrado_voice_rate", e.target.value);
      if (window.soundManager) {
        window.soundManager.speechRate = rate;
      }
    });
  }
  if (window.soundManager) {
    window.soundManager.speechRate = parseFloat(savedVoiceRate) || 0.95;
  }

  // ========== SISTEMA DE ALARME E NOTIFICAÇÃO AUTOMÁTICA ==========
  const alarmHandles = {};  // { itemId: { timeoutId, intervalId, attempts } }
  const firedNotifications = new Set();
  const ALARM_REPEAT_MS = 2 * 60 * 1000;  // 2 minutos
  const ALARM_MAX_ATTEMPTS = 5;

  function triggerNotificationForItem(item) {
    const fireKey = `${item.id}_${item.data_hora_alvo}`;
    if (firedNotifications.has(fireKey)) return;
    firedNotifications.add(fireKey);

    if (window.soundManager) {
      window.soundManager.playPleasantChime();
      window.soundManager.notify(
        `Lembrete: ${item.titulo}`,
        "Está na hora da sua atividade agendada."
      );
      if (window.soundManager.voiceFeedbackEnabled) {
        setTimeout(() => {
          window.soundManager.speak(`Lembrete: ${item.titulo}.`);
        }, 500);
      }
    }
  }

  function scheduleAlarm(item) {
    if (!item || !item.data_hora_alvo || item.status === "concluido" || item.confirmado_tomado) return;
    if (item.tipo_notificacao === "silencioso") return;

    const targetTime = new Date(item.data_hora_alvo).getTime();
    if (isNaN(targetTime)) return;
    const now = Date.now();
    let delay = targetTime - now;

    // Se já passou há mais de 30 minutos, não dispara alarme antigo ao abrir o app
    if (delay < -30 * 60 * 1000) return;
    if (delay < 0) delay = 0;
    // Evita overflow de setTimeout (> 24h)
    if (delay > 24 * 60 * 60 * 1000) return;

    const itemId = item.id;
    stopAlarm(itemId);

    const isAlarmMode = item.categoria === "medicacao" || item.tipo_notificacao === "alarme";

    // Modo Notificação Simples (compromissos e tarefas com aviso)
    if (!isAlarmMode) {
      const fireKey = `${item.id}_${item.data_hora_alvo}`;
      if (firedNotifications.has(fireKey)) return;
      const handle = { timeoutId: null, intervalId: null, attempts: 0 };
      handle.timeoutId = setTimeout(() => {
        triggerNotificationForItem(item);
      }, delay);
      alarmHandles[itemId] = handle;
      return;
    }

    // Modo Alarme Contínuo (Medicações e itens urgentes)
    const handle = { timeoutId: null, intervalId: null, attempts: 0 };
    handle.timeoutId = setTimeout(() => {
      triggerAlarmForItem(item, handle);

      handle.intervalId = setInterval(() => {
        handle.attempts++;
        if (handle.attempts >= ALARM_MAX_ATTEMPTS) {
          stopAlarm(itemId);
          if (window.soundManager) {
            window.soundManager.notify("Lembrete não confirmado", `Você não confirmou: ${item.titulo}.`);
          }
          openEscalationModal(item);
          return;
        }
        triggerAlarmForItem(item, handle);
      }, ALARM_REPEAT_MS);
    }, delay);

    alarmHandles[itemId] = handle;
  }

  function triggerAlarmForItem(item, handle) {
    const fireKey = `${item.id}_${item.data_hora_alvo}`;
    firedNotifications.add(fireKey);
    if (window.soundManager) {
      window.soundManager.playPleasantChime();
      window.soundManager.notify("Hora do Lembrete", `Você precisa confirmar: ${item.titulo}`);
      setTimeout(() => {
        if (window.soundManager && window.soundManager.voiceFeedbackEnabled) {
          const msg = item.categoria === "medicacao"
            ? `Hora do seu medicamento: ${item.titulo}. Você já tomou?`
            : `Atenção ao seu compromisso: ${item.titulo}.`;
          window.soundManager.speak(msg);
        }
      }, 600);
    }
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
    Object.keys(alarmHandles).forEach(id => stopAlarm(id));
    items.forEach(item => {
      if (item.status !== "concluido" && !item.confirmado_tomado && item.data_hora_alvo) {
        scheduleAlarm(item);
      }
    });
  }

  // Watchdog a cada 15s para garantir disparo mesmo se o navegador pausar timers em segundo plano
  setInterval(() => {
    if (!allLoadedItems || allLoadedItems.length === 0) return;
    const now = Date.now();
    allLoadedItems.forEach(item => {
      if (item.status === "concluido" || item.confirmado_tomado || !item.data_hora_alvo) return;
      if (item.tipo_notificacao === "silencioso") return;
      const targetTime = new Date(item.data_hora_alvo).getTime();
      if (isNaN(targetTime)) return;
      const diff = now - targetTime;
      if (diff >= 0 && diff <= 10 * 60 * 1000) {
        const fireKey = `${item.id}_${item.data_hora_alvo}`;
        if (!firedNotifications.has(fireKey)) {
          const isAlarmMode = item.categoria === "medicacao" || item.tipo_notificacao === "alarme";
          if (isAlarmMode) {
            triggerAlarmForItem(item, alarmHandles[item.id] || {});
          } else {
            triggerNotificationForItem(item);
          }
        }
      }
    });
  }, 15000);

  // Gerenciamento de Permissão de Notificações do Dispositivo
  const optSettingsPermNotif = document.getElementById("opt-settings-perm-notif");
  const notifPermStatusText = document.getElementById("notif-perm-status-text");
  const btnToggleNotifPerm = document.getElementById("btn-toggle-notif-perm");

  function updateNotificationPermissionUI() {
    if (!("Notification" in window)) {
      if (notifPermStatusText) notifPermStatusText.textContent = "Dispositivo sem suporte a notificações web.";
      if (btnToggleNotifPerm) {
        btnToggleNotifPerm.textContent = "Indisponível";
        btnToggleNotifPerm.disabled = true;
      }
      return;
    }

    const perm = Notification.permission;
    if (perm === "granted") {
      if (notifPermStatusText) notifPermStatusText.textContent = "Notificações ativas no dispositivo.";
      if (btnToggleNotifPerm) {
        btnToggleNotifPerm.textContent = "Ativo";
        btnToggleNotifPerm.style.background = "#16a34a";
      }
    } else if (perm === "denied") {
      if (notifPermStatusText) notifPermStatusText.textContent = "Bloqueado pelo navegador. Toque no cadeado da URL para liberar.";
      if (btnToggleNotifPerm) {
        btnToggleNotifPerm.textContent = "Bloqueado";
        btnToggleNotifPerm.style.background = "#dc2626";
      }
    } else {
      if (notifPermStatusText) notifPermStatusText.textContent = "Toque para permitir avisos na tela e alarmes.";
      if (btnToggleNotifPerm) {
        btnToggleNotifPerm.textContent = "Permitir";
        btnToggleNotifPerm.style.background = "var(--primary)";
      }
    }
  }

  updateNotificationPermissionUI();

  if (btnToggleNotifPerm || optSettingsPermNotif) {
    const handlePermAction = async () => {
      if (!("Notification" in window)) {
        alert("Seu navegador não suporta notificações web.");
        return;
      }
      if (Notification.permission === "denied") {
        alert("As notificações estão bloqueadas nas configurações do seu navegador para este site. Para ativar, toque no ícone de cadeado ao lado do endereço e selecione 'Permitir notificações'.");
        return;
      }
      if (window.soundManager) {
        const result = await window.soundManager.requestNotificationPermission();
        updateNotificationPermissionUI();
        if (result === "granted") {
          window.soundManager.playSuccessChime();
          window.soundManager.notify("Bem Lembrado", "Notificações ativadas com sucesso no seu dispositivo!");
        }
      }
    };

    if (btnToggleNotifPerm) btnToggleNotifPerm.addEventListener("click", (e) => {
      e.stopPropagation();
      handlePermAction();
    });
    if (optSettingsPermNotif) optSettingsPermNotif.addEventListener("click", handlePermAction);
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
      onError: (err) => {
        if (micWrapper) micWrapper.classList.remove("recording");
        if (micBtn) micBtn.innerHTML = ICONS.mic;
        if (voiceStatus) {
          if (err === "not-allowed" || err === "permission-denied") {
            voiceStatus.textContent = "Microfone bloqueado. Permita o microfone no topo do navegador (ícone de cadeado).";
          } else if (err === "service-not-allowed") {
            voiceStatus.textContent = "Serviço de voz indisponível ou Ditado desativado no teclado do celular.";
          } else if (err === "network") {
            voiceStatus.textContent = "Erro de conexão com o serviço de voz. Verifique sua internet.";
          } else if (err === "audio-capture") {
            voiceStatus.textContent = "Nenhum microfone encontrado ou está sendo usado por outro app.";
          } else if (err !== "no-speech") {
            voiceStatus.textContent = "Não foi possível ouvir. Toque para tentar de novo ou use 'Digitar texto'.";
          } else {
            voiceStatus.textContent = "Nenhum som detectado. Toque para tentar novamente.";
          }
          setTimeout(() => {
            voiceStatus.textContent = "Toque no microfone para falar";
          }, 4500);
        }
      }
    });
  } catch (err) {}

  if (voice && !voice.isSupported && voiceStatus) {
    voiceStatus.textContent = "Navegador sem suporte a voz. Toque no botão 'Digitar texto' abaixo.";
  }

  if (micBtn) {
    micBtn.addEventListener("click", () => {
      if (voice && voice.isSupported) {
        voice.toggle();
      } else {
        const manual = prompt("Digite seu lembrete (ex: 'Remédio de pressão às 20h'):");
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
        body: JSON.stringify({ 
          transcription: text,
          usuario_id: activeProfile.id || "idoso"
        })
      });

      const result = await response.json();
      if (result.success) {
        const count = result.total_created || 1;
        const msg = count > 1 
          ? `${count} lembretes organizados com sucesso!` 
          : "Lembrete anotado com sucesso!";

        if (window.soundManager) {
          window.soundManager.playSuccessChime();
          if (window.soundManager.voiceFeedbackEnabled) {
            window.soundManager.speak(count > 1 
              ? `Entendido! Criei ${count} lembretes para você.` 
              : "Lembrete anotado com sucesso!");
          }
        }
        if (voiceStatus) voiceStatus.textContent = msg;
        if (liveTranscription) liveTranscription.textContent = "";
        setTimeout(() => {
          if (voiceStatus) {
            voiceStatus.textContent = activeProfile.role === "simplificado" 
              ? "Toque no microfone para falar seu lembrete" 
              : (activeProfile.role === "cuidador" ? "Grave um lembrete ou instrução de voz" : "Toque no microfone para falar");
          }
        }, 3000);
        loadItems();
      }
    } catch (e) {
      if (voiceStatus) voiceStatus.textContent = "Erro de conexão com o servidor.";
    }
  }

  // 7. Carregar Itens do Banco de Dados
  async function loadItems() {
    try {
      let url = `/api/items?usuario_id=${encodeURIComponent(activeProfile.id)}`;
      if (activeProfile.role === "cuidador") {
        const depId = activeProfile.dependenteId || (activeProfile.dependenteName ? "idoso" : "");
        url = `/api/items?usuario_id=${encodeURIComponent(activeProfile.id)}&dependente_id=${encodeURIComponent(depId || "idoso")}`;
      }
      const resp = await fetch(url);
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

    // Renderiza blocos com títulos limpos e profissionais
    if (blockFixados.length) {
      renderBlock("Fixados no Topo", blockFixados);
    }
    if (blockAtrasados.length) {
      renderBlock("Atrasados e Pendentes", blockAtrasados);
    }
    if (blockHoje.length) {
      renderBlock("Para Hoje", blockHoje);
    }
    if (blockFuturos.length) {
      renderBlock("Próximos Dias", blockFuturos);
    }
    if (blockConcluidos.length) {
      renderBlock("Concluídos", blockConcluidos);
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
    
    // Status visual limpo (sem emojis)
    let statusClass = "";
    let statusBadge = "";
    if (item.status === "concluido") {
      statusClass = "concluido";
      statusBadge = `<span class="status-badge concluido">${ICONS.check} Concluído</span>`;
    } else if (itemDate && itemDate < now) {
      statusClass = "atrasado";
      statusBadge = `<span class="status-badge atrasado">${ICONS.alert} Atrasado</span>`;
    } else if (itemDate && (itemDate - now) < 45 * 60 * 1000) {
      statusClass = "proximo";
      statusBadge = `<span class="status-badge proximo">${ICONS.clock} Em breve</span>`;
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

      let timeStr = itemDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (item.data_hora_fim) {
        const endDate = new Date(item.data_hora_fim);
        const endTimeStr = endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        timeStr = `${timeStr} - ${endTimeStr}`;
      }

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

    // Badge do modo de alerta / notificação com ícone SVG
    let notifType = item.tipo_notificacao || (item.categoria === 'medicacao' ? 'alarme' : (item.categoria === 'compromisso' ? 'notificacao' : 'silencioso'));
    let notifIcon = ICONS.eye;
    let notifLabel = "Tela";
    if (notifType === "alarme") {
      notifIcon = ICONS.alarm;
      notifLabel = "Alarme";
    } else if (notifType === "notificacao") {
      notifIcon = ICONS.bell;
      notifLabel = "Aviso";
    }
    const notifBadgeHtml = `
      <button class="card-notif-badge ${notifType} btn-change-notif" data-id="${item.id}" data-title="${item.titulo}" title="Modo de aviso: ${notifLabel}">
        ${notifIcon} <span>${notifLabel}</span>
      </button>
    `;

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
            ${notifBadgeHtml}
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

        ${activeProfile.role === "simplificado" && item.categoria === "medicacao" && item.status !== "concluido" && !item.confirmado_tomado ? `
          <button class="btn-simplified-confirm btn-trigger-check" data-id="${item.id}" data-name="${item.titulo}">
            ✓ JÁ TOMEI ESTE REMÉDIO
          </button>
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

    // Ação: Alterar Tipo de Notificação (1 Toque)
    document.querySelectorAll(".btn-change-notif").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        activeNotifItemId = btn.getAttribute("data-id");
        const title = btn.getAttribute("data-title");
        if (notifModalItemTitle) notifModalItemTitle.textContent = title;
        if (notifTypeModal) notifTypeModal.style.display = "flex";
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
    const SWIPE_ACTION_THRESHOLD = 0.75; // Menos sensível: exige 75% do card para ativar

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
      const progress = Math.min(Math.abs(currentX) / (cardWidth * SWIPE_ACTION_THRESHOLD), 1);
      
      if (Math.abs(currentX) > 15) {
        card.style.transform = `translateX(${currentX}px)`;
        card.style.opacity = `${1 - (progress * 0.35)}`;
        if (bg) {
          if (currentX > 0) {
            // Arrastar para a DIREITA: Deletar (Vermelho suave)
            bg.style.background = progress >= 1 
              ? "linear-gradient(135deg, #ef4444, #dc2626)" 
              : `rgba(239, 68, 68, ${progress * 0.7})`;
          } else {
            // Arrastar para a ESQUERDA: Concluir / Arquivar (Azul Bem Lembrado)
            bg.style.background = progress >= 1 
              ? "linear-gradient(135deg, #0284c7, #0369a1)" 
              : `rgba(2, 132, 199, ${progress * 0.7})`;
          }
        }
      }
    }, { passive: true });

    card.addEventListener("touchend", async () => {
      if (!isSwiping) return;
      isSwiping = false;
      card.style.transition = "transform 0.25s ease-out, opacity 0.25s ease-out";

      const cardWidth = card.offsetWidth;
      const progress = Math.abs(currentX) / (cardWidth * SWIPE_ACTION_THRESHOLD);

      if (progress >= 1) {
        if (currentX > 0) {
          // Deslizou para a DIREITA -> Excluir
          card.style.transform = "translateX(120%)";
          card.style.opacity = "0";
          setTimeout(async () => {
            await fetch(`/api/items/${id}`, { method: "DELETE" });
            loadItems();
          }, 200);
        } else {
          // Deslizou para a ESQUERDA -> Concluir / Arquivar
          card.style.transform = "translateX(-120%)";
          card.style.opacity = "0";
          setTimeout(async () => {
            await fetch(`/api/items/${id}/status`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: "concluido" })
            });
            loadItems();
          }, 200);
        }
      } else {
        // Não atingiu o limiar mínimo -> Volta para o centro
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
      window.soundManager.startContinuousAlarm(medName || "seu medicamento", 2200);
      window.soundManager.notify("Hora do Medicamento", `Você tomou: ${medName}?`);
    }
  }

  // Tratamento de atalhos rápidos PWA / URL params (?action=record, ?filter=medicacao)
  const urlParams = new URLSearchParams(window.location.search);
  const filterParam = urlParams.get("filter");
  const actionParam = urlParams.get("action");

  if (filterParam) {
    currentFilter = filterParam;
    if (filtersBar) {
      filtersBar.querySelectorAll(".filter-pill").forEach(p => {
        p.classList.toggle("active", p.getAttribute("data-filter") === filterParam);
      });
    }
  }

  if (actionParam === "record" && micBtn) {
    setTimeout(() => {
      micBtn.click();
    }, 450);
  }

  // Solicita permissão de notificações no primeiro toque em qualquer lugar
  document.addEventListener("click", () => {
    if (window.soundManager) {
      window.soundManager.requestNotificationPermission();
    }
  }, { once: true });

  // Verifica status da integração com a IA (diagnóstico silencioso no console)
  async function checkAIStatus() {
    try {
      const res = await fetch("/api/ai/status");
      if (res.ok) {
        const data = await res.json();
        console.log("[LembreVoz AI]", data.gemini_configured ? `Gemini Conectado (${data.key_prefix})` : "Modo Regras Local Ativo");
      }
    } catch (e) {}
  }

  checkAIStatus();
  loadItems();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
