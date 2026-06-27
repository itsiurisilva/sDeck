// Global State
let socket = null;
let currentProfileId = '';
let profiles = {};
let settings = {};
let state = {};
let editMode = false;
let selectedButtonCell = null; // { type: 'grid'|'fav', row, col, index }
let macroSteps = []; // live macro steps being edited

// OBS Connection States
let obsConnected = false;
let obsCurrentScene = '';
let obsMuteStates = {};
let obsStreamState = 'UNKNOWN';
let obsRecordState = 'UNKNOWN';
let obsScenes = [];
let obsInputs = [];
let obsActiveSceneItems = [];
let customSounds = [];
let localSpotifyProgress = 0;
let spotifyProgressInterval = null;

// DOM Elements
const elServerStatus = document.getElementById('status-server');
const elObsStatus = document.getElementById('status-obs');
const elSpotifyStatus = document.getElementById('status-spotify');
const elStreamBadge = document.getElementById('status-stream');
const elRecordBadge = document.getElementById('status-record');

const elEditModeCheckbox = document.getElementById('edit-mode-checkbox');
const elProfilesTabs = document.getElementById('profiles-tabs');
const elDeckGrid = document.getElementById('deck-grid');
const elFavoritesSlots = document.getElementById('favorites-slots');

// Drawer Sidebar Elements
const elDrawer = document.getElementById('editor-drawer');
const elDrawerClose = document.getElementById('editor-close');
const elEditorRow = document.getElementById('editor-row');
const elEditorCol = document.getElementById('editor-col');
const elBtnLabel = document.getElementById('btn-label');
const elBtnLabelImg = document.getElementById('btn-label-img');
const elBtnIcon = document.getElementById('btn-icon');
const elBtnColor = document.getElementById('btn-color');
const elBtnColorText = document.getElementById('btn-color-text');

const elBtnIconColor = document.getElementById('btn-icon-color');
const elBtnIconColorText = document.getElementById('btn-icon-color-text');
const elBtnTextColor = document.getElementById('btn-text-color');
const elBtnTextColorText = document.getElementById('btn-text-color-text');
const elBtnGlowColor = document.getElementById('btn-glow-color');
const elBtnGlowColorText = document.getElementById('btn-glow-color-text');

// Image upload drawer elements
const elVisualIconSection = document.getElementById('visual-icon-section');
const elVisualImageSection = document.getElementById('visual-image-section');
const elVisualTabIcon = document.getElementById('visual-tab-icon');
const elVisualTabImage = document.getElementById('visual-tab-image');
const elBtnImageDropZone = document.getElementById('btn-image-drop-zone');
const elBtnImageInput = document.getElementById('btn-image-input');
const elBtnImagePreviewContainer = document.getElementById('btn-image-preview-container');
const elBtnImagePreview = document.getElementById('btn-image-preview');
const elBtnRemoveImage = document.getElementById('btn-remove-image');
const elBtnImageUrl = document.getElementById('btn-image-url');

const elBtnActionType = document.getElementById('btn-action-type');
let activeDragSource = null;

const elFieldsObs = document.getElementById('fields-obs');
const elFieldsSystem = document.getElementById('fields-system');
const elFieldsNav = document.getElementById('fields-nav');
const elFieldsSound = document.getElementById('fields-sound');

const elObsCmd = document.getElementById('obs-cmd');
const elParamObsScene = document.getElementById('param-obs-scene');
const elObsSceneSelect = document.getElementById('obs-scene-select');
const elObsSceneText = document.getElementById('obs-scene-text');
const elParamObsInput = document.getElementById('param-obs-input');
const elObsInputSelect = document.getElementById('obs-input-select');
const elObsInputText = document.getElementById('obs-input-text');
const elParamObsCustom = document.getElementById('param-obs-custom');
const elObsCustomRequest = document.getElementById('obs-custom-request');
const elObsCustomParams = document.getElementById('obs-custom-params');

const elSystemCmd = document.getElementById('system-cmd');
const elNavTargetProfile = document.getElementById('nav-target-profile');

const elSaveActionBtn = document.getElementById('btn-save-action');
const elClearActionBtn = document.getElementById('btn-clear-action');

// Overlays & Settings Tabs Elements
const elSpotifyStatusText = document.getElementById('spotify-status-text');
const elBtnSpotifyAuth = document.getElementById('btn-spotify-auth');
const elSpotifyClientId = document.getElementById('spotify-client-id');
const elSpotifyClientSecret = document.getElementById('spotify-client-secret');
const elSpotifySettingsForm = document.getElementById('spotify-settings-form');

const elStreamlabsStatusText = document.getElementById('streamlabs-status-text');
const elStreamlabsToken = document.getElementById('streamlabs-token');
const elStreamlabsSettingsForm = document.getElementById('streamlabs-settings-form');

const elViewerCountInput = document.getElementById('viewer-count-input');
const elIsLiveCheckbox = document.getElementById('is-live-checkbox');
const elStreamInfoForm = document.getElementById('stream-info-form');

const elTwitchFollower = document.getElementById('twitch-follower');
const elTwitchSubscriber = document.getElementById('twitch-subscriber');
const elTwitchDonation = document.getElementById('twitch-donation');

const elTestAlertForm = document.getElementById('test-alert-form');
const elTestAlertType = document.getElementById('test-alert-type');
const elTestAlertName = document.getElementById('test-alert-name');
const elTestAlertMessage = document.getElementById('test-alert-message');
const elTestDonationGroup = document.getElementById('test-donation-group');
const elTestAlertAmount = document.getElementById('test-alert-amount');
const elTestSubGroup = document.getElementById('test-sub-group');
const elTestAlertTier = document.getElementById('test-alert-tier');

const elAlertsHistoryLog = document.getElementById('alerts-history-log');

// OBS Tab Elements
const elBtnObsConnect = document.getElementById('btn-obs-connect');
const elBtnObsDisconnect = document.getElementById('btn-obs-disconnect');
const elObsHost = document.getElementById('obs-host');
const elObsPort = document.getElementById('obs-port');
const elObsPassword = document.getElementById('obs-password');
const elObsAutoconnect = document.getElementById('obs-autoconnect');
const elObsSettingsForm = document.getElementById('obs-settings-form');
const elObsAudioInputsList = document.getElementById('obs-audio-inputs-list');
const elActiveSceneName = document.getElementById('active-scene-name');
const elObsScenesList = document.getElementById('obs-scenes-list');

// Twitch Chat & Mod Elements
const elTwitchChatIframe = document.getElementById('twitch-chat-iframe');
const elChatNoUserMessage = document.getElementById('chat-no-user-message');
const elTwitchUsernameInput = document.getElementById('twitch-username-input');
const elTwitchModviewLink = document.getElementById('twitch-modview-link');
const elBtnModClear = document.getElementById('btn-mod-clear');
const elBtnModSubonly = document.getElementById('btn-mod-subonly');
const elBtnModSubonlyoff = document.getElementById('btn-mod-subonlyoff');
const elBtnModEmoteonly = document.getElementById('btn-mod-emoteonly');
const elBtnModEmoteonlyoff = document.getElementById('btn-mod-emoteonlyoff');
const elBtnModCommercial = document.getElementById('btn-mod-commercial');

// Spotify Controller Elements
const elSpotifyTrack = document.getElementById('spotify-track');
const elSpotifyArtist = document.getElementById('spotify-artist');
const elSpotifyArt = document.getElementById('spotify-art');
const elSpotifyProgressFill = document.getElementById('spotify-progress-fill');
const elSpotifyTimeCur = document.getElementById('spotify-time-cur');
const elSpotifyTimeTotal = document.getElementById('spotify-time-total');
const elSpotifyTimeline = document.getElementById('spotify-timeline');
const elSpotifyVolumeSlider = document.getElementById('spotify-volume-slider');
const elSpotifyBtnPlayPause = document.getElementById('spotify-btn-play-pause');
const elSpotifyBtnPrev = document.getElementById('spotify-btn-prev');
const elSpotifyBtnNext = document.getElementById('spotify-btn-next');

// Soundboard Elements
const elSoundUploadZone = document.getElementById('sound-upload-zone');
const elSoundFileInput = document.getElementById('sound-file-input');
const elSoundboardCustomList = document.getElementById('soundboard-custom-list');
const elSoundSelect = document.getElementById('sound-select');

// Profile Settings Modal Elements
const elBtnManageProfiles = document.getElementById('btn-manage-profiles');
const elProfileModal = document.getElementById('profile-management-modal');
const elProfileModalClose = document.getElementById('profile-modal-close');
const elProfileRenameInput = document.getElementById('profile-rename-input');
const elProfileRowsSelect = document.getElementById('profile-rows-select');
const elProfileColsSelect = document.getElementById('profile-cols-select');
const elBtnSaveProfileSettings = document.getElementById('btn-save-profile-settings');
const elBtnDeleteProfile = document.getElementById('btn-delete-profile');

// OBS Sources List
const elObsSourcesList = document.getElementById('obs-sources-list');

// New feature elements
const elBtnExportProfiles = document.getElementById('btn-export-profiles');
const elBtnImportProfiles = document.getElementById('btn-import-profiles');
const elImportProfilesInput = document.getElementById('import-profiles-input');
const elIconSearchInput = document.getElementById('icon-search-input');
const elIconPickerGrid = document.getElementById('icon-picker-grid');
const elBtnLivePreview = document.getElementById('btn-live-preview');
const elPreviewIconEl = document.getElementById('preview-icon-el');
const elPreviewLabelEl = document.getElementById('preview-label-el');
const elFieldsClipboard = document.getElementById('fields-clipboard');
const elClipboardText = document.getElementById('clipboard-text');
const elFieldsMacro = document.getElementById('fields-macro');
const elMacroStepsList = document.getElementById('macro-steps-list');
const elMacroAddStepBtn = document.getElementById('macro-add-step-btn');

// OBS Toggle Source Visibility Parameters inside drawer
const elParamObsSource = document.getElementById('param-obs-source');
const elObsSourceSceneSelect = document.getElementById('obs-source-scene-select');
const elObsSourceSceneText = document.getElementById('obs-source-scene-text');
const elObsSourceNameSelect = document.getElementById('obs-source-name-select');
const elObsSourceNameText = document.getElementById('obs-source-name-text');

// Toast Notification
const elToast = document.getElementById('toast-notification');
const elToastMsg = document.getElementById('toast-message');

function showToast(message, isError = false) {
  elToastMsg.textContent = message;
  elToast.style.borderColor = isError ? 'var(--accent-red)' : 'var(--accent-gold)';
  elToast.style.boxShadow = isError ? '0 4px 20px var(--accent-red-glow)' : '0 4px 20px var(--accent-gold-glow)';
  elToast.classList.remove('hidden');
  setTimeout(() => {
    elToast.classList.add('hidden');
  }, 3500);
}

// -------------------------------------------------------------
// FEATURE: RIPPLE ANIMATION
// -------------------------------------------------------------
function addRipple(btn, e) {
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top  - size / 2;
  const ripple = document.createElement('span');
  ripple.className = 'ripple-circle';
  ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;`;
  btn.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
}

// -------------------------------------------------------------
// FEATURE: LIVE BUTTON PREVIEW
// -------------------------------------------------------------
function updateLivePreview() {
  if (!elBtnLivePreview) return;
  const useImage = currentVisualType === 'image';
  const label = useImage ? (elBtnLabelImg?.value || '') : (elBtnLabel?.value || '');
  const icon  = useImage ? '' : (elBtnIcon?.value || '');
  const color = elBtnColor?.value || '#1c2638';
  const iconColor  = elBtnIconColor?.value || '#ffffff';
  const textColor  = elBtnTextColor?.value || '#ffffff';
  const glowColor  = elBtnGlowColor?.value || color;
  const imgUrl     = useImage ? (elBtnImageUrl?.value || '') : '';

  elBtnLivePreview.style.background = color;
  elBtnLivePreview.style.boxShadow = `0 6px 20px rgba(0,0,0,0.55), 0 0 12px ${glowColor}55, inset 0 1px 1px rgba(255,255,255,0.14)`;
  elBtnLivePreview.style.borderColor = `${glowColor}55`;

  // Background image
  let bgEl = elBtnLivePreview.querySelector('.preview-bg-img');
  if (imgUrl) {
    if (!bgEl) {
      bgEl = document.createElement('div');
      bgEl.className = 'preview-bg-img';
      elBtnLivePreview.insertBefore(bgEl, elBtnLivePreview.firstChild);
    }
    bgEl.style.backgroundImage = `url(${imgUrl})`;
    elPreviewIconEl.style.display = 'none';
  } else {
    if (bgEl) bgEl.remove();
    elPreviewIconEl.style.display = '';
    elPreviewIconEl.style.color = iconColor;
    if (icon) {
      elPreviewIconEl.innerHTML = `<i data-lucide="${icon}"></i>`;
      lucide.createIcons({ nodes: [elPreviewIconEl] });
    } else {
      elPreviewIconEl.innerHTML = '';
    }
  }

  elPreviewLabelEl.textContent = label || '';
  elPreviewLabelEl.style.color = textColor;
}

// -------------------------------------------------------------
// FEATURE: ICON PICKER
// -------------------------------------------------------------
const ICON_LIST = [
  'play','pause','stop-circle','skip-back','skip-forward',
  'mic','mic-off','volume-2','volume-x','volume-1',
  'video','video-off','camera','camera-off',
  'monitor','monitor-off','tv',
  'music','headphones','radio','disc',
  'star','heart','zap','flame',
  'settings','settings-2','sliders',
  'user','users','shield','crown',
  'message-square','message-circle','send',
  'timer','clock','alarm-clock',
  'coffee','beer','gamepad-2','sword',
  'trending-up','activity','bar-chart-2',
  'bell','bell-off','alert-triangle',
  'check','check-circle','x','x-circle',
  'home','layout-grid','layers',
  'image','film','aperture',
  'gift','trophy','award','party-popper',
  'thumbs-up','thumbs-down',
  'eye','eye-off','lock','unlock',
  'power','wifi','bluetooth',
  'smile','laugh','sparkles',
  'refresh-cw','download','upload',
  'globe','navigation','link','external-link',
  'edit','trash-2','copy','clipboard',
  'command','terminal','code',
  'plus','minus','grid',
  'share-2','rss','broadcast',
  'sun','moon','cloud','rainbow'
];

function renderIconPicker(filter = '') {
  if (!elIconPickerGrid) return;
  const currentIcon = elBtnIcon?.value || '';
  const fl = filter.toLowerCase().trim();
  const icons = fl ? ICON_LIST.filter(i => i.includes(fl)) : ICON_LIST;

  elIconPickerGrid.innerHTML = '';
  icons.forEach(iconName => {
    const el = document.createElement('div');
    el.className = `icon-picker-item${iconName === currentIcon ? ' active' : ''}`;
    el.title = iconName;
    el.innerHTML = `<i data-lucide="${iconName}"></i>`;
    el.addEventListener('click', () => {
      if (elBtnIcon) elBtnIcon.value = iconName;
      document.querySelectorAll('.icon-picker-item').forEach(i => i.classList.remove('active'));
      el.classList.add('active');
      updateLivePreview();
    });
    elIconPickerGrid.appendChild(el);
  });
  lucide.createIcons({ nodes: [elIconPickerGrid] });
}

if (elIconSearchInput) {
  elIconSearchInput.addEventListener('input', (e) => renderIconPicker(e.target.value));
}
if (elBtnIcon) {
  elBtnIcon.addEventListener('input', () => {
    updateLivePreview();
    const val = elBtnIcon.value.trim();
    document.querySelectorAll('.icon-picker-item').forEach(el => {
      el.classList.toggle('active', el.title === val);
    });
  });
}

// -------------------------------------------------------------
// FEATURE: IMPORT / EXPORT PROFILES
// -------------------------------------------------------------
if (elBtnExportProfiles) {
  elBtnExportProfiles.addEventListener('click', () => {
    const json = JSON.stringify({ profiles, activeProfile: currentProfileId }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `streamerdeck-perfis-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Perfis exportados com sucesso!');
  });
}

if (elBtnImportProfiles) {
  elBtnImportProfiles.addEventListener('click', () => elImportProfilesInput?.click());
}

if (elImportProfilesInput) {
  elImportProfilesInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data.profiles) throw new Error('Ficheiro inválido: sem "profiles"');
      if (!confirm(`Importar ${Object.keys(data.profiles).length} perfil(is)? Os perfis atuais serão substituídos.`)) return;
      profiles = data.profiles;
      if (data.activeProfile && profiles[data.activeProfile]) {
        currentProfileId = data.activeProfile;
      }
      socket.send(JSON.stringify({ type: 'save_profiles', profiles, activeProfile: currentProfileId }));
      showToast('Perfis importados com sucesso!');
    } catch (err) {
      showToast(`Erro ao importar: ${err.message}`, true);
    }
    e.target.value = '';
  });
}

// -------------------------------------------------------------
// FEATURE: MACRO EXECUTION
// -------------------------------------------------------------
async function executeMacro(steps) {
  if (!steps || steps.length === 0) return;
  for (const step of steps) {
    if (step.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, step.delay));
    }
    if (step.type === 'nav') {
      const target = step.data?.targetProfile;
      if (target && profiles[target]) {
        currentProfileId = target;
        renderProfilesTabs();
        renderGrid();
      }
    } else if (step.type === 'clipboard') {
      try { await navigator.clipboard.writeText(step.data?.text || ''); showToast('Texto copiado!'); } catch(e) {}
    } else if (step.type !== 'none' && step.type) {
      socket.send(JSON.stringify({ type: 'trigger_action', actionType: step.type, actionData: step.data }));
    }
  }
}

// MACRO BUILDER UI
function renderMacroSteps() {
  if (!elMacroStepsList) return;
  elMacroStepsList.innerHTML = '';

  if (macroSteps.length === 0) {
    elMacroStepsList.innerHTML = '<div class="macro-empty-hint">Sem etapas. Adiciona uma abaixo.</div>';
    return;
  }

  macroSteps.forEach((step, idx) => {
    const div = document.createElement('div');
    div.className = 'macro-step';
    div.innerHTML = `
      <div class="macro-step-header">
        <div class="macro-step-num">${idx + 1}</div>
        <select class="macro-step-type-sel glass-input">
          <option value="obs"${step.type==='obs'?' selected':''}>OBS</option>
          <option value="sound"${step.type==='sound'?' selected':''}>Som</option>
          <option value="system"${step.type==='system'?' selected':''}>Sistema</option>
          <option value="nav"${step.type==='nav'?' selected':''}>Mudar Perfil</option>
          <option value="clipboard"${step.type==='clipboard'?' selected':''}>Copiar Texto</option>
        </select>
        <button class="macro-step-del" data-idx="${idx}">✕ Remover</button>
      </div>
      <div class="macro-step-params" id="macro-params-${idx}"></div>
      <div class="macro-step-delay-row">
        <span>Aguardar</span>
        <input type="number" class="glass-input macro-delay-input" value="${step.delay || 0}" min="0" step="100" data-idx="${idx}">
        <span>ms antes desta etapa</span>
      </div>
    `;

    const typeSelect = div.querySelector('.macro-step-type-sel');
    typeSelect.addEventListener('change', (e) => {
      macroSteps[idx].type = e.target.value;
      macroSteps[idx].data = {};
      renderMacroSteps();
    });

    div.querySelector('.macro-step-del').addEventListener('click', () => {
      macroSteps.splice(idx, 1);
      renderMacroSteps();
    });

    div.querySelector('.macro-delay-input').addEventListener('change', (e) => {
      macroSteps[idx].delay = parseInt(e.target.value) || 0;
    });

    elMacroStepsList.appendChild(div);
    renderMacroStepParams(idx, div.querySelector(`#macro-params-${idx}`));
  });
}

function renderMacroStepParams(idx, container) {
  const step = macroSteps[idx];
  container.innerHTML = '';

  if (step.type === 'obs') {
    const cmdSel = document.createElement('select');
    cmdSel.className = 'glass-input';
    const obsOpts = [
      ['SetCurrentProgramScene', 'Mudar Cena'],
      ['ToggleInputMute', 'Alternar Mudo'],
      ['ToggleStream', 'Alternar Stream'],
      ['ToggleRecord', 'Alternar Gravação'],
    ];
    obsOpts.forEach(([v, l]) => {
      const o = document.createElement('option');
      o.value = v; o.textContent = l;
      if ((step.data?.command) === v) o.selected = true;
      cmdSel.appendChild(o);
    });
    cmdSel.addEventListener('change', (e) => {
      step.data = { command: e.target.value, params: {} };
      renderMacroStepParams(idx, container);
    });
    container.appendChild(cmdSel);
    if (!step.data?.command) step.data = { command: 'SetCurrentProgramScene', params: {} };

    if (step.data.command === 'SetCurrentProgramScene') {
      const sceneSel = document.createElement('select');
      sceneSel.className = 'glass-input';
      sceneSel.innerHTML = '<option value="">-- Selecione cena --</option>';
      obsScenes.forEach(s => {
        const o = document.createElement('option');
        o.value = s; o.textContent = s;
        if (step.data.params?.sceneName === s) o.selected = true;
        sceneSel.appendChild(o);
      });
      sceneSel.addEventListener('change', (e) => { if (!step.data.params) step.data.params = {}; step.data.params.sceneName = e.target.value; });
      container.appendChild(sceneSel);
    } else if (step.data.command === 'ToggleInputMute') {
      const inputSel = document.createElement('select');
      inputSel.className = 'glass-input';
      inputSel.innerHTML = '<option value="">-- Selecione entrada --</option>';
      obsInputs.forEach(s => {
        const o = document.createElement('option');
        o.value = s; o.textContent = s;
        if (step.data.params?.inputName === s) o.selected = true;
        inputSel.appendChild(o);
      });
      inputSel.addEventListener('change', (e) => { if (!step.data.params) step.data.params = {}; step.data.params.inputName = e.target.value; });
      container.appendChild(inputSel);
    }

  } else if (step.type === 'sound') {
    const soundSel = document.createElement('select');
    soundSel.className = 'glass-input';
    soundSel.innerHTML = '<option value="">-- Selecione som --</option>';
    const synths = ['airhorn','siren','coin','laser','boom','success'];
    synths.forEach(s => {
      const o = document.createElement('option');
      o.value = s; o.textContent = `Sintetizador: ${s}`;
      if (step.data?.file === s) o.selected = true;
      soundSel.appendChild(o);
    });
    customSounds.forEach(s => {
      const o = document.createElement('option');
      o.value = s.id; o.textContent = s.name;
      if (step.data?.file === s.id) o.selected = true;
      soundSel.appendChild(o);
    });
    soundSel.addEventListener('change', (e) => { step.data = { file: e.target.value }; });
    if (!step.data?.file) step.data = { file: '' };
    container.appendChild(soundSel);

  } else if (step.type === 'system') {
    const ta = document.createElement('textarea');
    ta.className = 'glass-input';
    ta.rows = 2;
    ta.placeholder = 'Ex: start chrome, powershell -Command "..."';
    ta.value = step.data?.command || '';
    ta.addEventListener('input', (e) => { step.data = { command: e.target.value }; });
    if (!step.data) step.data = { command: '' };
    container.appendChild(ta);

  } else if (step.type === 'nav') {
    const navSel = document.createElement('select');
    navSel.className = 'glass-input';
    navSel.innerHTML = '<option value="">-- Selecione perfil --</option>';
    Object.keys(profiles).forEach(pId => {
      const o = document.createElement('option');
      o.value = pId; o.textContent = profiles[pId].name;
      if (step.data?.targetProfile === pId) o.selected = true;
      navSel.appendChild(o);
    });
    navSel.addEventListener('change', (e) => { step.data = { targetProfile: e.target.value }; });
    if (!step.data) step.data = {};
    container.appendChild(navSel);

  } else if (step.type === 'clipboard') {
    const ta = document.createElement('textarea');
    ta.className = 'glass-input';
    ta.rows = 2;
    ta.placeholder = 'Texto a copiar...';
    ta.value = step.data?.text || '';
    ta.addEventListener('input', (e) => { step.data = { text: e.target.value }; });
    if (!step.data) step.data = { text: '' };
    container.appendChild(ta);
  }
}

if (elMacroAddStepBtn) {
  elMacroAddStepBtn.addEventListener('click', () => {
    macroSteps.push({ type: 'obs', delay: 0, data: { command: 'SetCurrentProgramScene', params: {} } });
    renderMacroSteps();
  });
}

// -------------------------------------------------------------
// TAB SYSTEM NAVIGATION
// -------------------------------------------------------------
document.querySelectorAll('.app-tabs .tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.app-tabs .tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
    const targetId = btn.getAttribute('data-tab');
    document.getElementById(targetId).classList.add('active');
  });
});

// -------------------------------------------------------------
// WEBSOCKET LOGIC
// -------------------------------------------------------------
function connectWebSocket() {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${wsProtocol}//${window.location.host}`;
  
  console.log(`Connecting to WebSocket server at ${wsUrl}...`);
  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log('WebSocket connection opened');
    elServerStatus.classList.remove('disconnected');
    elServerStatus.classList.add('connected');
    showToast('Conectado ao Servidor!');
    socket.send(JSON.stringify({ type: 'init' }));
  };

  socket.onmessage = (event) => {
    let msg;
    try {
      msg = JSON.parse(event.data);
    } catch (e) {
      console.error('Failed to parse WebSocket message:', event.data);
      return;
    }

    switch (msg.type) {
      case 'init_data':
        profiles = msg.profiles;
        currentProfileId = msg.activeProfile;
        settings = msg.settings;
        
        // Sync connection state & UI
        updateObsStatus(msg.obsConnected, msg.obsCurrentScene, msg.obsMuteStates, msg.obsStreamState, msg.obsRecordState);
        obsScenes = msg.obsScenes || [];
        obsInputs = msg.obsInputs || [];
        obsActiveSceneItems = msg.obsActiveSceneItems || [];

        // Sync forms
        populateObsSettingsForm();
        populateSpotifyForm();
        populateStreamlabsForm();
        populateTwitchSettingsForm();

        // Render sections
        renderProfilesTabs();
        renderGrid();
        populateEditorDropdowns();
        renderObsControlPanel();
        renderObsActiveSceneSources();
        loadSoundboardCustomSounds();
        break;

      case 'profiles_updated':
        profiles = msg.profiles;
        currentProfileId = msg.activeProfile;
        renderProfilesTabs();
        renderGrid();
        populateEditorDropdowns();
        break;

      case 'settings_updated':
        settings = msg.settings;
        showToast('Configurações atualizadas!');
        populateObsSettingsForm();
        populateSpotifyForm();
        populateStreamlabsForm();
        populateTwitchSettingsForm();
        break;

      case 'obs_status':
        updateObsStatus(msg.connected, msg.currentScene, msg.muteStates, msg.streamState, msg.recordState);
        if (msg.connected) {
          obsScenes = msg.scenes || [];
          obsInputs = msg.inputs || [];
          obsActiveSceneItems = msg.sources || [];
          populateEditorDropdowns();
          renderObsControlPanel();
          renderObsActiveSceneSources();
          showToast('Conectado ao OBS Studio!');
        } else {
          obsActiveSceneItems = [];
          renderObsControlPanel();
          renderObsActiveSceneSources();
          if (msg.error) {
            showToast(`Erro de conexão com OBS: ${msg.error}`, true);
          }
        }
        renderGrid();
        break;

      case 'obs_details':
        obsScenes = msg.scenes || [];
        obsInputs = msg.inputs || [];
        populateEditorDropdowns();
        renderObsControlPanel();
        renderObsActiveSceneSources();
        break;

      case 'obs_event':
        handleObsEvent(msg.eventName, msg.eventData);
        break;

      case 'obs_scene_sources':
        obsActiveSceneItems = msg.sources || [];
        renderObsActiveSceneSources();
        populateEditorDropdowns();
        break;

      case 'spotify':
        updateSpotifyPlaystate(msg.data);
        break;

      case 'twitch':
        updateTwitchStats(msg.data);
        break;

      case 'play_sound':
        playAudioFile(msg.sound);
        break;

      case 'alert':
        addAlertToHistory(msg.data);
        break;

      case 'error':
        showToast(msg.message, true);
        break;
    }
  };

  socket.onclose = () => {
    console.log('WebSocket connection closed. Retrying in 3s...');
    elServerStatus.classList.remove('connected');
    elServerStatus.classList.add('disconnected');
    elObsStatus.classList.remove('connected');
    elObsStatus.classList.add('disconnected');
    obsConnected = false;
    setTimeout(connectWebSocket, 3000);
  };
}

// -------------------------------------------------------------
// SPOTIFY FRONTEND LOGIC
// -------------------------------------------------------------
function updateSpotifyPlaystate(spotifyState) {
  if (spotifyState && spotifyState.isPlaying) {
    elSpotifyStatus.classList.remove('disconnected');
    elSpotifyStatus.classList.add('connected');
    elSpotifyStatusText.textContent = `Tocando: ${spotifyState.title} - ${spotifyState.artist}`;
    elSpotifyStatusText.className = "status-badge connected";
  } else {
    elSpotifyStatus.classList.remove('connected');
    elSpotifyStatus.classList.add('disconnected');
    elSpotifyStatusText.textContent = "Nenhuma música tocando";
    elSpotifyStatusText.className = "status-badge disconnected";
  }
}

function populateSpotifyForm() {
  if (settings.spotify) {
    elSpotifyClientId.value = settings.spotify.client_id || '';
    elSpotifyClientSecret.value = settings.spotify.client_secret || '';
    
    if (settings.spotify.refresh_token) {
      elBtnSpotifyAuth.classList.add('hidden');
    } else if (settings.spotify.client_id) {
      elBtnSpotifyAuth.classList.remove('hidden');
    } else {
      elBtnSpotifyAuth.classList.add('hidden');
    }
  }
}

elSpotifySettingsForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const client_id = elSpotifyClientId.value.trim();
  const client_secret = elSpotifyClientSecret.value.trim();

  try {
    const response = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        spotify_client_id: client_id,
        spotify_client_secret: client_secret
      })
    });
    const result = await response.json();
    if (result.success) {
      showToast('Credenciais Spotify salvas!');
      if (client_id && client_secret) {
        elBtnSpotifyAuth.classList.remove('hidden');
      }
    } else {
      showToast('Erro ao salvar credenciais.', true);
    }
  } catch (err) {
    showToast('Erro na requisição.', true);
  }
});

elBtnSpotifyAuth.addEventListener('click', () => {
  window.open('/login', 'Spotify Login', 'width=600,height=600');
});

// -------------------------------------------------------------
// STREAMLABS FRONTEND LOGIC
// -------------------------------------------------------------
function populateStreamlabsForm() {
  if (settings.streamlabs) {
    elStreamlabsToken.value = settings.streamlabs.token || '';
  }
}

elStreamlabsSettingsForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const token = elStreamlabsToken.value.trim();

  try {
    const response = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        streamlabs_token: token
      })
    });
    const result = await response.json();
    if (result.success) {
      showToast('Token Streamlabs salvo!');
    } else {
      showToast('Erro ao salvar token.', true);
    }
  } catch (err) {
    showToast('Erro na requisição.', true);
  }
});

// -------------------------------------------------------------
// LIVE STREAM STATS & TEST ALERTS LOGIC
// -------------------------------------------------------------
function updateTwitchStats(twitchData) {
  if (!twitchData) return;
  elViewerCountInput.value = twitchData.viewerCount || 0;
  elIsLiveCheckbox.checked = twitchData.isLive || false;

  elTwitchFollower.textContent = twitchData.latestFollower || 'Nenhum';
  elTwitchSubscriber.textContent = twitchData.latestSub || 'Nenhum';
  if (twitchData.latestDonation) {
    elTwitchDonation.textContent = `${twitchData.latestDonation.name} (${twitchData.latestDonation.amount})`;
  } else {
    elTwitchDonation.textContent = 'Nenhuma';
  }

  // Update top live badge
  if (twitchData.isLive) {
    elStreamBadge.classList.remove('hidden');
  } else {
    elStreamBadge.classList.add('hidden');
  }
}

elStreamInfoForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const viewerCount = parseInt(elViewerCountInput.value) || 0;
  const isLive = elIsLiveCheckbox.checked;

  try {
    const response = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        viewer_count: viewerCount,
        is_live: isLive
      })
    });
    const result = await response.json();
    if (result.success) {
      showToast('Estado da stream atualizado!');
    }
  } catch (err) {
    showToast('Erro na requisição.', true);
  }
});

// Test alert form toggles
elTestAlertType.addEventListener('change', () => {
  const type = elTestAlertType.value;
  if (type === 'donation') {
    elTestDonationGroup.classList.remove('hidden');
    elTestSubGroup.classList.add('hidden');
  } else if (type === 'sub') {
    elTestDonationGroup.classList.add('hidden');
    elTestSubGroup.classList.remove('hidden');
  } else {
    elTestDonationGroup.classList.add('hidden');
    elTestSubGroup.classList.add('hidden');
  }
});

elTestAlertForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const type = elTestAlertType.value;
  const name = elTestAlertName.value.trim();
  const message = elTestAlertMessage.value.trim();
  const amount = elTestAlertAmount.value.trim();
  const tier = elTestAlertTier.value;

  try {
    const response = await fetch('/api/test-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, name, message, amount, tier })
    });
    const result = await response.json();
    if (result.success) {
      showToast('Alerta de teste disparado!');
      elTestAlertName.value = '';
      elTestAlertMessage.value = '';
    }
  } catch (err) {
    showToast('Erro ao disparar teste.', true);
  }
});

function addAlertToHistory(alertData) {
  const logEmpty = elAlertsHistoryLog.querySelector('.log-empty-state');
  if (logEmpty) logEmpty.remove();

  const item = document.createElement('div');
  item.className = 'log-item';
  
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`;
  
  let labelType = '';
  let details = '';
  if (alertData.alertType === 'follow') {
    labelType = 'FOLLOW';
    details = alertData.message || 'Seguiu!';
  } else if (alertData.alertType === 'sub') {
    labelType = `SUB ${alertData.tier || 'TIER 1'}`;
    details = alertData.message || 'Sub!';
  } else if (alertData.alertType === 'donation') {
    labelType = alertData.amount || 'DOAÇÃO';
    details = alertData.message || 'Doou!';
  }

  item.innerHTML = `
    <div class="log-item-left">
      <span class="log-item-name">${alertData.name} <span style="color:var(--text-muted);font-weight:normal;font-size:10px;">@ ${timeStr}</span></span>
      <span class="log-item-msg">${details}</span>
    </div>
    <span class="log-item-type ${alertData.alertType}">${labelType}</span>
  `;

  elAlertsHistoryLog.prepend(item);
}

// -------------------------------------------------------------
// OBS STUDIO TAB LOGIC
// -------------------------------------------------------------
function populateObsSettingsForm() {
  if (settings.obs) {
    elObsHost.value = settings.obs.host || 'localhost';
    elObsPort.value = settings.obs.port || '4455';
    elObsPassword.value = settings.obs.password || '';
    elObsAutoconnect.checked = settings.obs.autoConnect ?? true;
  }
}

function updateObsStatus(connected, activeScene = '', muteStates = {}, streamState = 'UNKNOWN', recordState = 'UNKNOWN') {
  obsConnected = connected;
  obsCurrentScene = activeScene;
  obsMuteStates = muteStates;
  obsStreamState = streamState;
  obsRecordState = recordState;

  // Header badges update
  if (connected) {
    elObsStatus.className = "status-indicator connected";
    elBtnObsConnect.classList.add('hidden');
    elBtnObsDisconnect.classList.remove('hidden');

    if (streamState === 'STREAM_STARTED') {
      elStreamBadge.classList.remove('hidden');
    } else {
      elStreamBadge.classList.add('hidden');
    }

    if (recordState === 'RECORD_STARTED' || recordState === 'RECORD_PAUSED') {
      elRecordBadge.classList.remove('hidden');
    } else {
      elRecordBadge.classList.add('hidden');
    }
  } else {
    elObsStatus.className = "status-indicator disconnected";
    elBtnObsConnect.classList.remove('hidden');
    elBtnObsDisconnect.classList.add('hidden');
    elStreamBadge.classList.add('hidden');
    elRecordBadge.classList.add('hidden');
  }
}

function handleObsEvent(eventName, data) {
  if (eventName === 'CurrentProgramSceneChanged') {
    obsCurrentScene = data.sceneName;
  } else if (eventName === 'InputMuteStateChanged') {
    obsMuteStates[data.inputName] = data.inputMuted;
  } else if (eventName === 'StreamStateChanged') {
    obsStreamState = data.outputState;
  } else if (eventName === 'RecordStateChanged') {
    obsRecordState = data.outputState;
  }
  updateObsStatus(obsConnected, obsCurrentScene, obsMuteStates, obsStreamState, obsRecordState);
  renderGrid();
  renderObsControlPanel();
}

elObsSettingsForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const host = elObsHost.value.trim();
  const port = elObsPort.value.trim();
  const password = elObsPassword.value.trim();
  const autoConnect = elObsAutoconnect.checked;

  const newSettings = {
    ...settings,
    obs: { host, port, password, autoConnect }
  };

  socket.send(JSON.stringify({
    type: 'save_settings',
    settings: newSettings
  }));
});

elBtnObsConnect.addEventListener('click', () => {
  socket.send(JSON.stringify({ type: 'obs_connect' }));
});

elBtnObsDisconnect.addEventListener('click', () => {
  socket.send(JSON.stringify({ type: 'obs_disconnect' }));
});

function renderObsControlPanel() {
  // Clear scene list
  if (!obsConnected) {
    elObsScenesList.innerHTML = '<div class="empty-state">Desconectado do OBS. Ligue o servidor do OBS WebSocket.</div>';
    elObsAudioInputsList.innerHTML = '<div class="empty-state">Desconectado do OBS.</div>';
    elActiveSceneName.textContent = 'Desconectado';
    return;
  }

  // Active scene title
  elActiveSceneName.textContent = obsCurrentScene || 'Nenhuma';

  // Render scenes list
  elObsScenesList.innerHTML = '';
  obsScenes.forEach(sceneName => {
    const item = document.createElement('div');
    item.className = `obs-scene-item ${sceneName === obsCurrentScene ? 'active-scene' : ''}`;
    item.innerHTML = `
      <span>${sceneName}</span>
      ${sceneName === obsCurrentScene ? '<i data-lucide="eye"></i>' : ''}
    `;
    item.addEventListener('click', () => {
      socket.send(JSON.stringify({
        type: 'trigger_action',
        actionType: 'obs',
        actionData: {
          command: 'SetCurrentProgramScene',
          params: { sceneName }
        }
      }));
    });
    elObsScenesList.appendChild(item);
  });

  // Render inputs list
  elObsAudioInputsList.innerHTML = '';
  if (obsInputs.length === 0) {
    elObsAudioInputsList.innerHTML = '<div class="empty-state">Nenhum canal de áudio disponível no OBS.</div>';
  } else {
    obsInputs.forEach(inputName => {
      const isMuted = obsMuteStates[inputName];
      const item = document.createElement('div');
      item.className = 'obs-audio-channel';
      item.innerHTML = `
        <span class="obs-channel-name">${inputName}</span>
        <button class="mute-btn ${isMuted ? 'active-muted' : ''}">
          <i data-lucide="${isMuted ? 'mic-off' : 'mic'}"></i> ${isMuted ? 'MUDO' : 'ATIVO'}
        </button>
      `;
      item.querySelector('button').addEventListener('click', () => {
        socket.send(JSON.stringify({
          type: 'trigger_action',
          actionType: 'obs',
          actionData: {
            command: 'ToggleInputMute',
            params: { inputName }
          }
        }));
      });
      elObsAudioInputsList.appendChild(item);
    });
  }

  lucide.createIcons();
}

// -------------------------------------------------------------
// STREAM DECK EDITOR & RENDERING LOGIC
// -------------------------------------------------------------
function renderProfilesTabs() {
  elProfilesTabs.innerHTML = '';
  Object.keys(profiles).forEach(pId => {
    const profile = profiles[pId];
    const btn = document.createElement('button');
    btn.className = `profile-tab ${pId === currentProfileId ? 'active' : ''}`;
    btn.textContent = profile.name;
    btn.addEventListener('click', () => {
      currentProfileId = pId;
      closeEditorDrawer();
      renderProfilesTabs();
      renderGrid();
    });
    elProfilesTabs.appendChild(btn);
  });
}

function renderGrid() {
  elDeckGrid.innerHTML = '';
  renderFavorites();

  const activeProfile = profiles[currentProfileId];
  if (!activeProfile) {
    elDeckGrid.innerHTML = '<div class="empty-state">Nenhum perfil de Stream Deck selecionado.</div>';
    return;
  }

  const rows = activeProfile.rows || 3;
  const cols = activeProfile.cols || 5;

  elDeckGrid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
  elDeckGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

  const occupied = Array(rows).fill(null).map(() => Array(cols).fill(false));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (occupied[r][c]) continue;

      const cellId = `${r}-${c}`;
      const btnData = activeProfile.buttons[cellId];
      const btn = document.createElement('button');
      btn.className = 'deck-btn';
      btn.setAttribute('data-row', r);
      btn.setAttribute('data-col', c);
      if (editMode) btn.classList.add('edit-glow');

      if (btnData) {
        btn.classList.add('has-action');

        const colSpan = Math.min(btnData.colSpan || 1, cols - c);
        const rowSpan = Math.min(btnData.rowSpan || 1, rows - r);

        btn.style.gridColumn = `span ${colSpan}`;
        btn.style.gridRow = `span ${rowSpan}`;

        for (let tr = 0; tr < rowSpan; tr++) {
          for (let tc = 0; tc < colSpan; tc++) {
            occupied[r + tr][c + tc] = true;
          }
        }

        if (editMode) {
          const resizeHandle = document.createElement('div');
          resizeHandle.className = 'deck-btn-resize-handle';
          resizeHandle.addEventListener('pointerdown', (e) => handlePointerDown(e, r, c, btnData, rows, cols));
          btn.appendChild(resizeHandle);
        }
        if (btnData.color) {
          btn.style.setProperty('--btn-accent', btnData.color);
          btn.style.setProperty('--btn-accent-glow', `${btnData.color}66`);
          btn.style.borderColor = 'rgba(255,255,255,0.2)';
        } else {
          btn.style.setProperty('--btn-accent', 'rgba(28, 38, 56, 0.8)');
          btn.style.setProperty('--btn-accent-glow', 'rgba(59, 130, 246, 0.35)');
        }

        btn.style.setProperty('--btn-icon-color', btnData.iconColor || '#ffffff');
        btn.style.setProperty('--btn-text-color', btnData.textColor || '#ffffff');
        const glowColor = btnData.glowColor || btnData.color || '#3b82f6';
        btn.style.setProperty('--btn-glow-color', glowColor);
        btn.style.setProperty('--btn-glow-color-glow', `${glowColor}66`);

        if (btnData.image) {
          btn.style.backgroundImage = `url(${btnData.image})`;
          btn.classList.add('has-bg-image');
        } else if (btnData.icon) {
          const iconDiv = document.createElement('div');
          iconDiv.className = 'deck-btn-icon';
          iconDiv.innerHTML = `<i data-lucide="${btnData.icon}"></i>`;
          btn.appendChild(iconDiv);
        }

        if (btnData.label) {
          const labelDiv = document.createElement('div');
          labelDiv.className = 'deck-btn-label';
          labelDiv.textContent = btnData.label;
          btn.appendChild(labelDiv);
        }

        // Active States
        let isActionActive = false;
        let isMuted = false;

        if (obsConnected && btnData.actionType === 'obs' && btnData.actionData) {
          const cmd = btnData.actionData.command;
          const params = btnData.actionData.params || {};

          if (cmd === 'SetCurrentProgramScene' && params.sceneName === obsCurrentScene) {
            isActionActive = true;
          } else if (cmd === 'ToggleInputMute') {
            const inputMuted = obsMuteStates[params.inputName];
            if (inputMuted === true) {
              isMuted = true;
              const iconEl = btn.querySelector('.deck-btn-icon i');
              if (iconEl) {
                if (btnData.icon === 'mic') iconEl.setAttribute('data-lucide', 'mic-off');
                else if (btnData.icon === 'volume-2' || btnData.icon === 'volume-1') iconEl.setAttribute('data-lucide', 'volume-x');
              }
            } else if (inputMuted === false) {
              isActionActive = true;
            }
          } else if (cmd === 'ToggleStream' && obsStreamState === 'STREAM_STARTED') {
            isActionActive = true;
            btn.classList.add('stream-pulsing');
          } else if (cmd === 'ToggleRecord' && (obsRecordState === 'RECORD_STARTED' || obsRecordState === 'RECORD_PAUSED')) {
            isActionActive = true;
            btn.classList.add('record-pulsing');
          }
        }

        if (isMuted) {
          btn.classList.add('muted');
        } else if (isActionActive) {
          btn.classList.add('active-scene');
        }
      } else {
        if (editMode) {
          btn.innerHTML = `<span style="color: var(--text-muted); font-size: 1.5rem;">+</span>`;
        } else {
          btn.innerHTML = '';
        }
      }

      if (editMode && selectedButtonCell && selectedButtonCell.type === 'grid' && selectedButtonCell.row === r && selectedButtonCell.col === c) {
        btn.style.boxShadow = '0 0 15px var(--accent-gold)';
        btn.style.borderColor = 'var(--accent-gold)';
      }

      // Drag & Drop
      if (editMode) {
        btn.setAttribute('draggable', 'true');
        btn.addEventListener('dragstart', (e) => {
          activeDragSource = { row: r, col: c };
          e.dataTransfer.setData('text/plain', JSON.stringify(activeDragSource));
          btn.style.opacity = '0.5';
        });
        btn.addEventListener('dragend', () => {
          btn.style.opacity = '1';
          elDeckGrid.querySelectorAll('.deck-btn').forEach(b => b.classList.remove('drag-over'));
        });
        btn.addEventListener('dragover', (e) => {
          e.preventDefault();
          btn.classList.add('drag-over');
        });
        btn.addEventListener('dragleave', () => {
          btn.classList.remove('drag-over');
        });
        btn.addEventListener('drop', (e) => {
          e.preventDefault();
          btn.classList.remove('drag-over');
          
          let dragData;
          try {
            dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
          } catch(err) {
            return;
          }
          
          const sourceRow = dragData.row;
          const sourceCol = dragData.col;
          if (sourceRow === undefined || sourceCol === undefined) return;
          if (sourceRow === r && sourceCol === c) return;
          
          const activeProfile = profiles[currentProfileId];
          if (!activeProfile) return;
          
          const sourceCellId = `${sourceRow}-${sourceCol}`;
          const targetCellId = `${r}-${c}`;
          
          const sourceData = activeProfile.buttons[sourceCellId];
          const targetData = activeProfile.buttons[targetCellId];
          
          // Swap
          if (sourceData) {
            activeProfile.buttons[targetCellId] = sourceData;
          } else {
            delete activeProfile.buttons[targetCellId];
          }
          
          if (targetData) {
            activeProfile.buttons[sourceCellId] = targetData;
          } else {
            delete activeProfile.buttons[sourceCellId];
          }
          
          socket.send(JSON.stringify({
            type: 'save_profiles',
            profiles: profiles
          }));
          
          renderGrid();
        });
      }

      btn.addEventListener('click', (e) => handleButtonClick(r, c, btnData, e));
      elDeckGrid.appendChild(btn);
    }
  }

  lucide.createIcons();
}

function handlePointerDown(e, startRow, startCol, btnData, rows, cols) {
  e.stopPropagation();
  e.preventDefault();

  const gridRect = elDeckGrid.getBoundingClientRect();
  const cellWidth = gridRect.width / cols;
  const cellHeight = gridRect.height / rows;

  const btn = elDeckGrid.querySelector(`[data-row="${startRow}"][data-col="${startCol}"]`);
  if (!btn) return;

  btn.setAttribute('draggable', 'false');

  const onPointerMove = (moveEv) => {
    const x = moveEv.clientX - gridRect.left;
    const y = moveEv.clientY - gridRect.top;

    const currentCol = Math.floor(x / cellWidth);
    const currentRow = Math.floor(y / cellHeight);

    let newColSpan = Math.max(1, currentCol - startCol + 1);
    let newRowSpan = Math.max(1, currentRow - startRow + 1);

    newColSpan = Math.min(newColSpan, cols - startCol);
    newRowSpan = Math.min(newRowSpan, rows - startRow);

    btn.style.gridColumn = `span ${newColSpan}`;
    btn.style.gridRow = `span ${newRowSpan}`;
  };

  const onPointerUp = (upEv) => {
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);

    const x = upEv.clientX - gridRect.left;
    const y = upEv.clientY - gridRect.top;

    const currentCol = Math.floor(x / cellWidth);
    const currentRow = Math.floor(y / cellHeight);

    let finalColSpan = Math.max(1, currentCol - startCol + 1);
    let finalRowSpan = Math.max(1, currentRow - startRow + 1);

    finalColSpan = Math.min(finalColSpan, cols - startCol);
    finalRowSpan = Math.min(finalRowSpan, rows - startRow);

    btn.setAttribute('draggable', 'true');

    btnData.colSpan = finalColSpan;
    btnData.rowSpan = finalRowSpan;

    socket.send(JSON.stringify({
      type: 'save_profiles',
      profiles: profiles
    }));

    renderGrid();
  };

  document.addEventListener('pointermove', onPointerMove);
  document.addEventListener('pointerup', onPointerUp);
}

function renderFavorites() {
  elFavoritesSlots.innerHTML = '';
  const activeProfile = profiles[currentProfileId];
  if (!activeProfile || !activeProfile.favorites) return;

  activeProfile.favorites.forEach((favData, idx) => {
    const slot = document.createElement('div');
    slot.className = 'favorites-slot';
    if (favData) {
      slot.classList.add('has-action');
      if (favData.color) {
        slot.style.setProperty('--btn-accent', favData.color);
      } else {
        slot.style.setProperty('--btn-accent', 'rgba(28, 38, 56, 0.8)');
      }

      slot.style.setProperty('--btn-icon-color', favData.iconColor || '#ffffff');
      slot.style.setProperty('--btn-text-color', favData.textColor || '#ffffff');
      const glowColor = favData.glowColor || favData.color || '#3b82f6';
      slot.style.setProperty('--btn-glow-color', glowColor);
      slot.style.setProperty('--btn-glow-color-glow', `${glowColor}66`);
      
      if (favData.image) {
        slot.style.backgroundImage = `url(${favData.image})`;
        slot.classList.add('has-bg-image');
        slot.innerHTML = `<div class="deck-btn-label">${favData.label || ''}</div>`;
      } else {
        slot.innerHTML = `
          <div class="deck-btn-icon"><i data-lucide="${favData.icon || 'star'}"></i></div>
          <div class="deck-btn-label">${favData.label || 'Fav'}</div>
        `;
      }

      if (obsConnected && favData.actionType === 'obs' && favData.actionData) {
        const cmd = favData.actionData.command;
        const params = favData.actionData.params || {};
        if (cmd === 'SetCurrentProgramScene' && params.sceneName === obsCurrentScene) {
          slot.classList.add('active-scene');
        }
      }
    } else {
      slot.innerHTML = `<span>Favorito ${idx+1}</span>`;
    }

    if (editMode && selectedButtonCell && selectedButtonCell.type === 'fav' && selectedButtonCell.index === idx) {
      slot.style.borderColor = 'var(--accent-gold)';
      slot.style.boxShadow = '0 0 8px var(--accent-gold-glow)';
    }

    slot.addEventListener('click', () => handleFavoriteClick(idx, favData));
    elFavoritesSlots.appendChild(slot);
  });
}

function handleButtonClick(row, col, btnData, clickEvent) {
  if (editMode) {
    selectedButtonCell = { type: 'grid', row, col };
    openEditorDrawer(row, col, btnData);
    renderGrid();
  } else if (btnData) {
    if (clickEvent) addRipple(clickEvent.currentTarget, clickEvent);
    executeAction(btnData);
  }
}

function handleFavoriteClick(index, favData) {
  if (editMode) {
    selectedButtonCell = { type: 'fav', index };
    openEditorDrawer(-1, -1, favData);
    renderFavorites();
  } else if (favData) {
    executeAction(favData);
  }
}

function executeAction(btnData) {
  if (btnData.actionType === 'nav') {
    const target = btnData.actionData.targetProfile;
    if (profiles[target]) {
      currentProfileId = target;
      renderProfilesTabs();
      renderGrid();
    }
  } else if (btnData.actionType === 'clipboard') {
    const text = btnData.actionData?.text || '';
    navigator.clipboard.writeText(text).then(() => showToast('Texto copiado!')).catch(() => showToast('Erro ao copiar', true));
  } else if (btnData.actionType === 'macro') {
    executeMacro(btnData.actionData?.steps || []);
  } else {
    socket.send(JSON.stringify({
      type: 'trigger_action',
      actionType: btnData.actionType,
      actionData: btnData.actionData
    }));
  }
}

// -------------------------------------------------------------
// DRAWER EDITOR LOGIC
// -------------------------------------------------------------
function openEditorDrawer(row, col, btnData) {
  elDrawer.classList.remove('hidden');
  if (row >= 0) {
    elEditorRow.textContent = row;
    elEditorCol.textContent = col;
  } else {
    elEditorRow.textContent = 'Favorito';
    elEditorCol.textContent = selectedButtonCell.index + 1;
  }

  // Populate form fields
  if (btnData) {
    const hasImage = !!btnData.image;
    setVisualType(hasImage ? 'image' : 'icon');

    elBtnLabel.value = btnData.label || '';
    elBtnLabelImg.value = btnData.label || '';
    elBtnIcon.value = btnData.icon || '';

    // Image state
    if (hasImage) {
      elBtnImageUrl.value = btnData.image;
      elBtnImagePreview.src = btnData.image;
      elBtnImagePreviewContainer.style.display = '';
      elBtnImageDropZone.style.display = 'none';
    } else {
      elBtnImageUrl.value = '';
      elBtnImagePreview.src = '';
      elBtnImagePreviewContainer.style.display = 'none';
      elBtnImageDropZone.style.display = '';
    }

    elBtnColor.value = btnData.color || '#3b82f6';
    elBtnColorText.value = btnData.color || '#3b82f6';

    elBtnIconColor.value = btnData.iconColor || '#ffffff';
    elBtnIconColorText.value = btnData.iconColor || '#ffffff';

    elBtnTextColor.value = btnData.textColor || '#ffffff';
    elBtnTextColorText.value = btnData.textColor || '#ffffff';

    elBtnGlowColor.value = btnData.glowColor || btnData.color || '#3b82f6';
    elBtnGlowColorText.value = btnData.glowColor || btnData.color || '#3b82f6';

    elBtnActionType.value = btnData.actionType || 'none';
  } else {
    setVisualType('icon');

    elBtnLabel.value = '';
    elBtnLabelImg.value = '';
    elBtnIcon.value = '';
    elBtnImageUrl.value = '';
    elBtnImagePreview.src = '';
    elBtnImagePreviewContainer.style.display = 'none';
    elBtnImageDropZone.style.display = '';

    elBtnColor.value = '#3b82f6';
    elBtnColorText.value = '#3b82f6';

    elBtnIconColor.value = '#ffffff';
    elBtnIconColorText.value = '#ffffff';

    elBtnTextColor.value = '#ffffff';
    elBtnTextColorText.value = '#ffffff';

    elBtnGlowColor.value = '#3b82f6';
    elBtnGlowColorText.value = '#3b82f6';

    elBtnActionType.value = 'none';
  }

  toggleEditorActionFields();

  // Populate new action fields
  if (elClipboardText) elClipboardText.value = '';
  macroSteps = [];

  // Populate specific action details
  if (btnData && btnData.actionData) {
    const data = btnData.actionData;
    if (btnData.actionType === 'obs') {
      elObsCmd.value = data.command || 'SetCurrentProgramScene';
      toggleObsParamFields();

      if (data.command === 'SetCurrentProgramScene') {
        elObsSceneSelect.value = data.params?.sceneName || '';
        elObsSceneText.value = data.params?.sceneName || '';
      } else if (data.command === 'ToggleInputMute') {
        elObsInputSelect.value = data.params?.inputName || '';
        elObsInputText.value = data.params?.inputName || '';
      } else if (data.command === 'ToggleSourceVisibility') {
        elObsSourceSceneSelect.value = data.params?.sceneName || '';
        elObsSourceSceneText.value = data.params?.sceneName || '';
        elObsSourceNameSelect.value = data.params?.sourceName || '';
        elObsSourceNameText.value = data.params?.sourceName || '';
      } else if (data.command === 'Custom') {
        elObsCustomRequest.value = data.customRequest || '';
        elObsCustomParams.value = JSON.stringify(data.params || {});
      }
    } else if (btnData.actionType === 'system') {
      elSystemCmd.value = data.command || '';
    } else if (btnData.actionType === 'nav') {
      elNavTargetProfile.value = data.targetProfile || '';
    } else if (btnData.actionType === 'sound') {
      elSoundSelect.value = data.file || '';
    } else if (btnData.actionType === 'clipboard') {
      if (elClipboardText) elClipboardText.value = data.text || '';
    } else if (btnData.actionType === 'macro') {
      macroSteps = JSON.parse(JSON.stringify(data.steps || []));
      renderMacroSteps();
    }
  } else {
    elObsCmd.value = 'SetCurrentProgramScene';
    elObsSceneSelect.value = '';
    elObsSceneText.value = '';
    elObsInputSelect.value = '';
    elObsInputText.value = '';
    elObsSourceSceneSelect.value = '';
    elObsSourceSceneText.value = '';
    elObsSourceNameSelect.value = '';
    elObsSourceNameText.value = '';
    elObsCustomRequest.value = '';
    elObsCustomParams.value = '';
    elSystemCmd.value = '';
    elNavTargetProfile.value = '';
    elSoundSelect.value = '';
    toggleObsParamFields();
  }

  // Init icon picker & live preview
  renderIconPicker('');
  if (elIconSearchInput) elIconSearchInput.value = '';
  updateLivePreview();
}

function closeEditorDrawer() {
  elDrawer.classList.add('hidden');
  selectedButtonCell = null;
  renderGrid();
  renderFavorites();
}

elDrawerClose.addEventListener('click', closeEditorDrawer);

// -------------------------------------------------------------
// VISUAL TYPE SWITCHING (Icon vs Image)
// -------------------------------------------------------------
let currentVisualType = 'icon';

function setVisualType(type) {
  currentVisualType = type;
  if (type === 'icon') {
    elVisualIconSection.style.display = '';
    elVisualImageSection.style.display = 'none';
    elVisualTabIcon.classList.add('active');
    elVisualTabImage.classList.remove('active');
  } else {
    elVisualIconSection.style.display = 'none';
    elVisualImageSection.style.display = '';
    elVisualTabIcon.classList.remove('active');
    elVisualTabImage.classList.add('active');
  }
  updateLivePreview();
}

elVisualTabIcon.addEventListener('click', () => setVisualType('icon'));
elVisualTabImage.addEventListener('click', () => setVisualType('image'));

// Image drop zone
elBtnImageDropZone.addEventListener('click', () => elBtnImageInput.click());

elBtnImageDropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  elBtnImageDropZone.classList.add('dragover');
});

elBtnImageDropZone.addEventListener('dragleave', () => {
  elBtnImageDropZone.classList.remove('dragover');
});

elBtnImageDropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  elBtnImageDropZone.classList.remove('dragover');
  if (e.dataTransfer.files.length > 0) {
    uploadButtonImage(e.dataTransfer.files[0]);
  }
});

elBtnImageInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    uploadButtonImage(e.target.files[0]);
  }
});

elBtnRemoveImage.addEventListener('click', () => {
  elBtnImageUrl.value = '';
  elBtnImagePreview.src = '';
  elBtnImagePreviewContainer.style.display = 'none';
  elBtnImageDropZone.style.display = '';
  updateLivePreview();
});

async function uploadButtonImage(file) {
  if (!file.type.startsWith('image/')) {
    showToast('Apenas ficheiros de imagem são aceites.', true);
    return;
  }

  const formData = new FormData();
  formData.append('image', file);
  showToast('A fazer upload da imagem...');

  try {
    const response = await fetch('/api/button-image/upload', {
      method: 'POST',
      body: formData
    });
    const result = await response.json();
    if (result.success) {
      elBtnImageUrl.value = result.url;
      elBtnImagePreview.src = result.url;
      elBtnImagePreviewContainer.style.display = '';
      elBtnImageDropZone.style.display = 'none';
      showToast('Imagem carregada com sucesso!');
      updateLivePreview();
    } else {
      showToast(`Falha no upload: ${result.error}`, true);
    }
  } catch (err) {
    showToast('Erro ao fazer upload da imagem.', true);
  }
}

elBtnColor.addEventListener('input', (e) => {
  elBtnColorText.value = e.target.value;
  updateLivePreview();
});

elBtnColorText.addEventListener('input', (e) => {
  if (e.target.value.match(/^#[0-9A-Fa-f]{6}$/)) {
    elBtnColor.value = e.target.value;
    updateLivePreview();
  }
});

elBtnIconColor.addEventListener('input', (e) => {
  elBtnIconColorText.value = e.target.value;
  updateLivePreview();
});

elBtnIconColorText.addEventListener('input', (e) => {
  if (e.target.value.match(/^#[0-9A-Fa-f]{6}$/)) {
    elBtnIconColor.value = e.target.value;
    updateLivePreview();
  }
});

elBtnTextColor.addEventListener('input', (e) => {
  elBtnTextColorText.value = e.target.value;
  updateLivePreview();
});

elBtnTextColorText.addEventListener('input', (e) => {
  if (e.target.value.match(/^#[0-9A-Fa-f]{6}$/)) {
    elBtnTextColor.value = e.target.value;
    updateLivePreview();
  }
});

elBtnGlowColor.addEventListener('input', (e) => {
  elBtnGlowColorText.value = e.target.value;
  updateLivePreview();
});

elBtnGlowColorText.addEventListener('input', (e) => {
  if (e.target.value.match(/^#[0-9A-Fa-f]{6}$/)) {
    elBtnGlowColor.value = e.target.value;
    updateLivePreview();
  }
});

elBtnLabel?.addEventListener('input', updateLivePreview);
elBtnLabelImg?.addEventListener('input', updateLivePreview);

elBtnActionType.addEventListener('change', toggleEditorActionFields);
elObsCmd.addEventListener('change', toggleObsParamFields);

function toggleEditorActionFields() {
  const type = elBtnActionType.value;
  elFieldsObs.classList.add('hidden');
  elFieldsSystem.classList.add('hidden');
  elFieldsNav.classList.add('hidden');
  elFieldsSound.classList.add('hidden');
  elFieldsClipboard?.classList.add('hidden');
  elFieldsMacro?.classList.add('hidden');

  if (type === 'obs') elFieldsObs.classList.remove('hidden');
  else if (type === 'system') elFieldsSystem.classList.remove('hidden');
  else if (type === 'nav') elFieldsNav.classList.remove('hidden');
  else if (type === 'sound') elFieldsSound.classList.remove('hidden');
  else if (type === 'clipboard') elFieldsClipboard?.classList.remove('hidden');
  else if (type === 'macro') {
    elFieldsMacro?.classList.remove('hidden');
    renderMacroSteps();
  }
}

function toggleObsParamFields() {
  const cmd = elObsCmd.value;
  elParamObsScene.classList.add('hidden');
  elParamObsInput.classList.add('hidden');
  elParamObsCustom.classList.add('hidden');
  elParamObsSource.classList.add('hidden');

  if (cmd === 'SetCurrentProgramScene') elParamObsScene.classList.remove('hidden');
  else if (cmd === 'ToggleInputMute') elParamObsInput.classList.remove('hidden');
  else if (cmd === 'ToggleSourceVisibility') elParamObsSource.classList.remove('hidden');
  else if (cmd === 'Custom') elParamObsCustom.classList.remove('hidden');
}

elObsSceneSelect.addEventListener('change', () => {
  elObsSceneText.value = elObsSceneSelect.value;
});

elObsInputSelect.addEventListener('change', () => {
  elObsInputText.value = elObsInputSelect.value;
});

elObsSourceSceneSelect.addEventListener('change', () => {
  elObsSourceSceneText.value = elObsSourceSceneSelect.value;
});

elObsSourceNameSelect.addEventListener('change', () => {
  elObsSourceNameText.value = elObsSourceNameSelect.value;
});

function populateEditorDropdowns() {
  // Scene select
  elObsSceneSelect.innerHTML = '<option value="">-- Selecione a Cena --</option>';
  obsScenes.forEach(scene => {
    const opt = document.createElement('option');
    opt.value = scene;
    opt.textContent = scene;
    elObsSceneSelect.appendChild(opt);
  });

  // Input select
  elObsInputSelect.innerHTML = '<option value="">-- Selecione a Entrada --</option>';
  obsInputs.forEach(input => {
    const opt = document.createElement('option');
    opt.value = input;
    opt.textContent = input;
    elObsInputSelect.appendChild(opt);
  });

  // Nav profile target select
  elNavTargetProfile.innerHTML = '<option value="">-- Selecione o Perfil --</option>';
  Object.keys(profiles).forEach(pId => {
    const opt = document.createElement('option');
    opt.value = pId;
    opt.textContent = profiles[pId].name;
    elNavTargetProfile.appendChild(opt);
  });

  // OBS Toggle Source Scene Select
  elObsSourceSceneSelect.innerHTML = '<option value="">-- Selecione a Cena --</option>';
  obsScenes.forEach(scene => {
    const opt = document.createElement('option');
    opt.value = scene;
    opt.textContent = scene;
    elObsSourceSceneSelect.appendChild(opt);
  });

  // OBS Toggle Source Name Select
  elObsSourceNameSelect.innerHTML = '<option value="">-- Selecione a Fonte --</option>';
  obsActiveSceneItems.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item.sourceName;
    opt.textContent = item.sourceName;
    elObsSourceNameSelect.appendChild(opt);
  });

  populateDrawerSoundSelect();
}

// Save Action Trigger
elSaveActionBtn.addEventListener('click', () => {
  if (!selectedButtonCell) return;
  const activeProfile = profiles[currentProfileId];
  if (!activeProfile) return;

  const useImage = currentVisualType === 'image';
  const label = useImage ? elBtnLabelImg.value.trim() : elBtnLabel.value.trim();
  const icon = useImage ? '' : elBtnIcon.value.trim();
  const image = useImage ? (elBtnImageUrl.value || null) : null;

  let colSpan = 1;
  let rowSpan = 1;
  if (selectedButtonCell.type === 'grid') {
    const cellId = `${selectedButtonCell.row}-${selectedButtonCell.col}`;
    const existingBtn = activeProfile.buttons[cellId];
    if (existingBtn) {
      colSpan = existingBtn.colSpan || 1;
      rowSpan = existingBtn.rowSpan || 1;
    }
  }

  const color = elBtnColor.value;
  const iconColor = elBtnIconColor.value;
  const textColor = elBtnTextColor.value;
  const glowColor = elBtnGlowColor.value;
  const actionType = elBtnActionType.value;

  let actionData = null;

  if (actionType === 'obs') {
    const command = elObsCmd.value;
    let params = {};
    if (command === 'SetCurrentProgramScene') {
      params = { sceneName: elObsSceneText.value.trim() };
    } else if (command === 'ToggleInputMute') {
      params = { inputName: elObsInputText.value.trim() };
    } else if (command === 'ToggleSourceVisibility') {
      params = {
        sceneName: elObsSourceSceneText.value.trim(),
        sourceName: elObsSourceNameText.value.trim()
      };
    } else if (command === 'Custom') {
      try {
        params = JSON.parse(elObsCustomParams.value || '{}');
      } catch(e) {
        showToast('JSON inválido nos parâmetros customizados OBS', true);
        return;
      }
    }
    actionData = { command, params };
  } else if (actionType === 'system') {
    actionData = { command: elSystemCmd.value.trim() };
  } else if (actionType === 'nav') {
    actionData = { targetProfile: elNavTargetProfile.value };
  } else if (actionType === 'sound') {
    actionData = { file: elSoundSelect.value };
  } else if (actionType === 'clipboard') {
    actionData = { text: elClipboardText?.value || '' };
  } else if (actionType === 'macro') {
    if (macroSteps.length === 0) {
      showToast('Adiciona pelo menos uma etapa ao macro!', true);
      return;
    }
    actionData = { steps: JSON.parse(JSON.stringify(macroSteps)) };
  }

  const btnData = actionType !== 'none'
    ? { label, icon, image, color, iconColor, textColor, glowColor, colSpan, rowSpan, actionType, actionData }
    : null;

  if (selectedButtonCell.type === 'grid') {
    const cellId = `${selectedButtonCell.row}-${selectedButtonCell.col}`;
    if (btnData) {
      activeProfile.buttons[cellId] = btnData;
    } else {
      delete activeProfile.buttons[cellId];
    }
  } else if (selectedButtonCell.type === 'fav') {
    activeProfile.favorites[selectedButtonCell.index] = btnData;
  }

  // Update backend
  socket.send(JSON.stringify({
    type: 'save_profiles',
    profiles: profiles
  }));

  closeEditorDrawer();
});

// Clear button action
elClearActionBtn.addEventListener('click', () => {
  if (!selectedButtonCell) return;
  const activeProfile = profiles[currentProfileId];
  if (!activeProfile) return;

  if (selectedButtonCell.type === 'grid') {
    const cellId = `${selectedButtonCell.row}-${selectedButtonCell.col}`;
    delete activeProfile.buttons[cellId];
  } else if (selectedButtonCell.type === 'fav') {
    activeProfile.favorites[selectedButtonCell.index] = null;
  }

  socket.send(JSON.stringify({
    type: 'save_profiles',
    profiles: profiles
  }));

  closeEditorDrawer();
});

// Profile Actions
document.getElementById('btn-add-profile').addEventListener('click', () => {
  const name = prompt("Nome do novo perfil:");
  if (!name || name.trim() === '') return;
  
  const id = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  if (profiles[id]) {
    showToast('Este perfil já existe!', true);
    return;
  }

  profiles[id] = {
    id,
    name: name.trim(),
    rows: 3,
    cols: 5,
    buttons: {},
    favorites: [null, null, null, null, null]
  };

  socket.send(JSON.stringify({
    type: 'save_profiles',
    profiles: profiles,
    activeProfile: id
  }));
});

elEditModeCheckbox.addEventListener('change', () => {
  editMode = elEditModeCheckbox.checked;
  if (editMode) {
    document.body.classList.add('edit-mode-active');
  } else {
    document.body.classList.remove('edit-mode-active');
    closeEditorDrawer();
  }
  renderGrid();
});

// -------------------------------------------------------------
// SPOTIFY CONTROLLER PLAYBACK & PROGRESS ANIMATIONS
// -------------------------------------------------------------
async function controlSpotify(action, value = null) {
  let body = { action };
  if (action === 'toggle') {
    const isPlaying = elSpotifyStatus.classList.contains('connected');
    body.action = isPlaying ? 'pause' : 'play';
  } else if (value !== null) {
    body.value = value;
  }

  try {
    const response = await fetch('/api/spotify/control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const res = await response.json();
    if (!res.success) {
      showToast(`Erro no Spotify: ${res.error || 'Erro desconhecido'}`, true);
    }
  } catch (err) {
    showToast('Erro ao controlar Spotify', true);
  }
}

function updateSpotifyPlaystate(spotifyState) {
  if (spotifyState && spotifyState.isPlaying) {
    elSpotifyStatus.classList.remove('disconnected');
    elSpotifyStatus.classList.add('connected');
    elSpotifyStatusText.textContent = `Tocando: ${spotifyState.title} - ${spotifyState.artist}`;
    elSpotifyStatusText.className = "status-badge connected";

    // Sync interactive card
    elSpotifyTrack.textContent = spotifyState.title;
    elSpotifyArtist.textContent = spotifyState.artist;
    elSpotifyTimeTotal.textContent = spotifyState.durationStr;
    elSpotifyBtnPlayPause.innerHTML = '<i data-lucide="pause"></i>';
    
    if (spotifyState.albumArt) {
      elSpotifyArt.style.backgroundImage = `url(${spotifyState.albumArt})`;
      elSpotifyArt.innerHTML = '';
      elSpotifyArt.classList.add('spinning');
    } else {
      elSpotifyArt.style.backgroundImage = '';
      elSpotifyArt.innerHTML = '<i data-lucide="music"></i>';
      elSpotifyArt.classList.remove('spinning');
    }

    // Sync progress timeline
    localSpotifyProgress = parseProgressStringToMs(spotifyState.progressStr);
    const totalMs = parseProgressStringToMs(spotifyState.durationStr);
    updateSpotifyProgressUI(localSpotifyProgress, totalMs);

    startSpotifyLocalProgressTimer(totalMs);
  } else {
    elSpotifyStatus.classList.remove('connected');
    elSpotifyStatus.classList.add('disconnected');
    elSpotifyStatusText.textContent = "Nenhuma música tocando";
    elSpotifyStatusText.className = "status-badge disconnected";

    // Clean interactive card
    elSpotifyTrack.textContent = "Nenhuma música tocando";
    elSpotifyArtist.textContent = "Spotify Player";
    elSpotifyTimeCur.textContent = "0:00";
    elSpotifyTimeTotal.textContent = "0:00";
    elSpotifyProgressFill.style.width = "0%";
    elSpotifyBtnPlayPause.innerHTML = '<i data-lucide="play"></i>';
    elSpotifyArt.style.backgroundImage = '';
    elSpotifyArt.innerHTML = '<i data-lucide="music"></i>';
    elSpotifyArt.classList.remove('spinning');

    stopSpotifyLocalProgressTimer();
  }
  lucide.createIcons();
}

function parseProgressStringToMs(str) {
  const parts = str.split(':');
  if (parts.length === 2) {
    return (parseInt(parts[0]) * 60 + parseInt(parts[1])) * 1000;
  }
  return 0;
}

function formatMsToProgressString(ms) {
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

function updateSpotifyProgressUI(curMs, totalMs) {
  elSpotifyTimeCur.textContent = formatMsToProgressString(curMs);
  const percent = totalMs > 0 ? (curMs / totalMs) * 100 : 0;
  elSpotifyProgressFill.style.width = `${Math.min(100, percent)}%`;
}

function startSpotifyLocalProgressTimer(totalMs) {
  stopSpotifyLocalProgressTimer();
  spotifyProgressInterval = setInterval(() => {
    localSpotifyProgress += 1000;
    if (localSpotifyProgress > totalMs) {
      localSpotifyProgress = totalMs;
    }
    updateSpotifyProgressUI(localSpotifyProgress, totalMs);
  }, 1000);
}

function stopSpotifyLocalProgressTimer() {
  if (spotifyProgressInterval) {
    clearInterval(spotifyProgressInterval);
    spotifyProgressInterval = null;
  }
}

elSpotifyBtnPlayPause.addEventListener('click', () => controlSpotify('toggle'));
elSpotifyBtnPrev.addEventListener('click', () => controlSpotify('previous'));
elSpotifyBtnNext.addEventListener('click', () => controlSpotify('next'));

elSpotifyVolumeSlider.addEventListener('change', (e) => {
  controlSpotify('volume', e.target.value);
});

elSpotifyTimeline.addEventListener('click', (e) => {
  const rect = elSpotifyTimeline.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const totalWidth = rect.width;
  const percent = clickX / totalWidth;
  
  const totalMs = parseProgressStringToMs(elSpotifyTimeTotal.textContent);
  if (totalMs > 0) {
    const targetMs = Math.floor(percent * totalMs);
    controlSpotify('seek', targetMs);
  }
});

// -------------------------------------------------------------
// SOUNDBOARD & WEB AUDIO SYNTHESIZER
// -------------------------------------------------------------
function playAudioFile(soundName) {
  const synths = ['airhorn', 'siren', 'coin', 'laser', 'boom', 'success'];
  if (synths.includes(soundName)) {
    triggerLocalSynthSound(soundName);
  } else {
    const src = soundName.startsWith('/uploads') ? soundName : `/uploads/${soundName}`;
    const audio = new Audio(src);
    audio.play().catch(err => {
      console.warn('Erro ao tocar áudio:', err);
    });
  }
}

function triggerLocalSynthSound(type) {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  
  if (type === 'coin') {
    playTone(audioCtx, 587.33, 'sine', 0.08, 0, () => {
      playTone(audioCtx, 880, 'sine', 0.25, 0.08);
    });
  } else if (type === 'laser') {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.35);
    
    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.linearRampToValueAtTime(0.01, now + 0.35);
    
    osc.start(now);
    osc.stop(now + 0.35);
  } else if (type === 'success') {
    const now = audioCtx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      const start = now + (i * 0.08);
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.frequency.setValueAtTime(freq, start);
      gainNode.gain.setValueAtTime(0.15, start);
      gainNode.gain.linearRampToValueAtTime(0.01, start + 0.2);
      
      osc.start(start);
      osc.stop(start + 0.2);
    });
  } else if (type === 'boom') {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(10, now + 0.8);
    
    gainNode.gain.setValueAtTime(0.4, now);
    gainNode.gain.linearRampToValueAtTime(0.01, now + 0.8);
    
    osc.start(now);
    osc.stop(now + 0.8);
  } else if (type === 'airhorn') {
    const frequencies = [300, 303, 306, 600, 606];
    const now = audioCtx.currentTime;
    frequencies.forEach(freq => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      
      gainNode.gain.setValueAtTime(0.08, now);
      gainNode.gain.linearRampToValueAtTime(0.08, now + 0.45);
      gainNode.gain.linearRampToValueAtTime(0.01, now + 0.6);
      
      osc.start(now);
      osc.stop(now + 0.6);
    });
  } else if (type === 'siren') {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.linearRampToValueAtTime(800, now + 0.25);
    osc.frequency.linearRampToValueAtTime(400, now + 0.5);
    osc.frequency.linearRampToValueAtTime(800, now + 0.75);
    osc.frequency.linearRampToValueAtTime(400, now + 1.0);
    
    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.linearRampToValueAtTime(0.2, now + 1.0);
    gainNode.gain.linearRampToValueAtTime(0.01, now + 1.15);
    
    osc.start(now);
    osc.stop(now + 1.15);
  }
}

function playTone(ctx, freq, type, duration, delay = 0, callback = null) {
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  const start = ctx.currentTime + delay;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gainNode.gain.setValueAtTime(0.15, start);
  gainNode.gain.linearRampToValueAtTime(0.01, start + duration);
  
  osc.start(start);
  osc.stop(start + duration);
  if (callback) {
    setTimeout(callback, (delay + duration) * 1000);
  }
}

async function loadSoundboardCustomSounds() {
  try {
    const response = await fetch('/api/soundboard/sounds');
    const sounds = await response.json();
    customSounds = sounds;
    
    elSoundboardCustomList.innerHTML = '';
    if (sounds.length === 0) {
      elSoundboardCustomList.innerHTML = '<div class="empty-state">Sem sons customizados carregados.</div>';
    } else {
      sounds.forEach(sound => {
        const item = document.createElement('div');
        item.className = 'soundboard-list-item';
        item.innerHTML = `
          <div class="sound-info-left">
            <span class="sound-name-label">${sound.name}</span>
            <span class="sound-id-sub">ID: ${sound.id}</span>
          </div>
          <div class="sound-actions-right">
            <button class="sound-act-btn play-btn" title="Tocar Som">
              <i data-lucide="play"></i>
            </button>
            <button class="sound-act-btn copy-btn" title="Copiar ID do Som">
              <i data-lucide="copy"></i>
            </button>
          </div>
        `;
        
        item.querySelector('.play-btn').addEventListener('click', () => {
          socket.send(JSON.stringify({
            type: 'trigger_action',
            actionType: 'sound',
            actionData: { file: sound.id }
          }));
        });
        
        item.querySelector('.copy-btn').addEventListener('click', () => {
          navigator.clipboard.writeText(sound.id).then(() => {
            showToast('ID do som copiado para o clipboard!');
          });
        });
        
        elSoundboardCustomList.appendChild(item);
      });
    }
    
    populateDrawerSoundSelect();
    lucide.createIcons();
  } catch (err) {
    console.error('Error loading soundboard custom sounds:', err);
  }
}

function populateDrawerSoundSelect() {
  if (!elSoundSelect) return;
  elSoundSelect.innerHTML = '<option value="">-- Selecione o Som --</option>';
  
  const synths = [
    { id: 'airhorn', name: 'Sintetizador: Airhorn' },
    { id: 'siren', name: 'Sintetizador: Sirene' },
    { id: 'coin', name: 'Sintetizador: Moeda' },
    { id: 'laser', name: 'Sintetizador: Laser' },
    { id: 'boom', name: 'Sintetizador: Boom' },
    { id: 'success', name: 'Sintetizador: Sucesso' }
  ];
  synths.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = s.name;
    elSoundSelect.appendChild(opt);
  });
  
  customSounds.forEach(sound => {
    const opt = document.createElement('option');
    opt.value = sound.id;
    opt.textContent = `Upload: ${sound.name}`;
    elSoundSelect.appendChild(opt);
  });
}

document.querySelectorAll('.soundboard-btn.synth-effect').forEach(btn => {
  btn.addEventListener('click', () => {
    const soundType = btn.getAttribute('data-sound');
    socket.send(JSON.stringify({
      type: 'trigger_action',
      actionType: 'sound',
      actionData: { file: soundType }
    }));
  });
});

elSoundUploadZone.addEventListener('click', () => elSoundFileInput.click());

elSoundUploadZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  elSoundUploadZone.classList.add('dragover');
});

elSoundUploadZone.addEventListener('dragleave', () => {
  elSoundUploadZone.classList.remove('dragover');
});

elSoundUploadZone.addEventListener('drop', (e) => {
  e.preventDefault();
  elSoundUploadZone.classList.remove('dragover');
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    uploadSoundboardFile(files[0]);
  }
});

elSoundFileInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    uploadSoundboardFile(e.target.files[0]);
  }
});

async function uploadSoundboardFile(file) {
  const formData = new FormData();
  formData.append('sound', file);
  
  showToast('Fazendo upload do áudio...');
  try {
    const response = await fetch('/api/soundboard/upload', {
      method: 'POST',
      body: formData
    });
    const result = await response.json();
    if (result.success) {
      showToast('Áudio carregado com sucesso!');
      loadSoundboardCustomSounds();
    } else {
      showToast(`Falha no upload: ${result.error}`, true);
    }
  } catch (err) {
    showToast('Erro ao fazer upload do som', true);
  }
}

// -------------------------------------------------------------
// PROFILE MANAGEMENT DIALOG/MODAL ACTIONS
// -------------------------------------------------------------
elBtnManageProfiles.addEventListener('click', () => {
  const activeProfile = profiles[currentProfileId];
  if (!activeProfile) return;
  
  elProfileRenameInput.value = activeProfile.name;
  elProfileRowsSelect.value = activeProfile.rows || 3;
  elProfileColsSelect.value = activeProfile.cols || 5;
  
  elProfileModal.classList.remove('hidden');
});

elProfileModalClose.addEventListener('click', () => {
  elProfileModal.classList.add('hidden');
});

elBtnSaveProfileSettings.addEventListener('click', () => {
  const activeProfile = profiles[currentProfileId];
  if (!activeProfile) return;
  
  const newName = elProfileRenameInput.value.trim();
  if (newName === '') {
    showToast('Nome do perfil não pode ser vazio', true);
    return;
  }
  
  const newRows = parseInt(elProfileRowsSelect.value);
  const newCols = parseInt(elProfileColsSelect.value);
  
  activeProfile.name = newName;
  activeProfile.rows = newRows;
  activeProfile.cols = newCols;
  
  socket.send(JSON.stringify({
    type: 'save_profiles',
    profiles: profiles,
    activeProfile: currentProfileId
  }));
  
  elProfileModal.classList.add('hidden');
  showToast('Perfil atualizado!');
});

elBtnDeleteProfile.addEventListener('click', () => {
  const keys = Object.keys(profiles);
  if (keys.length <= 1) {
    showToast('Não é possível excluir o único perfil existente!', true);
    return;
  }
  
  if (!confirm(`Deseja realmente excluir o perfil "${profiles[currentProfileId].name}"?`)) {
    return;
  }
  
  delete profiles[currentProfileId];
  const nextProfileId = Object.keys(profiles)[0];
  
  socket.send(JSON.stringify({
    type: 'save_profiles',
    profiles: profiles,
    activeProfile: nextProfileId
  }));
  
  currentProfileId = nextProfileId;
  elProfileModal.classList.add('hidden');
  showToast('Perfil excluído!');
});

// -------------------------------------------------------------
// TWITCH INTEGRATION & MODERATION PANEL
// -------------------------------------------------------------
function populateTwitchSettingsForm() {
  const user = settings.twitch ? settings.twitch.username : '';
  elTwitchUsernameInput.value = user;
  
  if (user) {
    elTwitchChatIframe.src = `https://www.twitch.tv/embed/${user}/chat?parent=${window.location.hostname}&darkpopout`;
    elChatNoUserMessage.classList.add('hidden');
    elTwitchModviewLink.href = `https://twitch.tv/moderator/${user}`;
  } else {
    elTwitchChatIframe.src = '';
    elChatNoUserMessage.classList.remove('hidden');
    elTwitchModviewLink.href = '#';
  }
}

function sendChatModAction(action) {
  const user = settings.twitch ? settings.twitch.username : '';
  if (!user) {
    showToast('Twitch username não configurado!', true);
    return;
  }
  
  let commandStr = '';
  switch (action) {
    case 'clear': commandStr = '/clear'; break;
    case 'subonly': commandStr = '/subonly'; break;
    case 'subonlyoff': commandStr = '/subonlyoff'; break;
    case 'emoteonly': commandStr = '/emoteonly'; break;
    case 'emoteonlyoff': commandStr = '/emoteonlyoff'; break;
    case 'commercial': commandStr = '/commercial 30'; break;
  }
  
  navigator.clipboard.writeText(commandStr).then(() => {
    showToast(`Comando "${commandStr}" copiado para o clipboard! Cole no chat.`);
  }).catch(() => {
    showToast(`Comando: "${commandStr}"`, false);
  });
}

elBtnModClear.addEventListener('click', () => sendChatModAction('clear'));
elBtnModSubonly.addEventListener('click', () => sendChatModAction('subonly'));
elBtnModSubonlyoff.addEventListener('click', () => sendChatModAction('subonlyoff'));
elBtnModEmoteonly.addEventListener('click', () => sendChatModAction('emoteonly'));
elBtnModEmoteonlyoff.addEventListener('click', () => sendChatModAction('emoteonlyoff'));
elBtnModCommercial.addEventListener('click', () => sendChatModAction('commercial'));

// -------------------------------------------------------------
// OBS SCENE SOURCE VISIBILITY MANAGEMENT
// -------------------------------------------------------------
function renderObsActiveSceneSources() {
  if (!obsConnected) {
    elObsSourcesList.innerHTML = '<div class="empty-state">Desconectado do OBS. Ligue o servidor do OBS WebSocket.</div>';
    return;
  }

  elObsSourcesList.innerHTML = '';
  if (obsActiveSceneItems.length === 0) {
    elObsSourcesList.innerHTML = '<div class="empty-state">Nenhuma fonte disponível nesta cena.</div>';
    return;
  }

  obsActiveSceneItems.forEach(item => {
    const isVisible = item.enabled;
    const div = document.createElement('div');
    div.className = `obs-source-item ${isVisible ? '' : 'disabled'}`;
    
    let iconName = 'eye';
    if (item.inputKind) {
      if (item.inputKind.includes('image')) iconName = 'image';
      else if (item.inputKind.includes('browser')) iconName = 'globe';
      else if (item.inputKind.includes('text')) iconName = 'type';
      else if (item.inputKind.includes('wasapi') || item.inputKind.includes('audio')) iconName = 'volume-2';
      else if (item.inputKind.includes('camera') || item.inputKind.includes('dshow')) iconName = 'video';
    }
    
    div.innerHTML = `
      <div class="obs-source-left">
        <i data-lucide="${iconName}"></i>
        <span class="obs-source-name">${item.sourceName}</span>
      </div>
      <button class="obs-source-visibility-btn ${isVisible ? 'visible' : ''}" title="Alternar Visibilidade">
        <i data-lucide="${isVisible ? 'eye' : 'eye-off'}"></i>
      </button>
    `;
    
    div.querySelector('button').addEventListener('click', () => {
      socket.send(JSON.stringify({
        type: 'trigger_action',
        actionType: 'obs',
        actionData: {
          command: 'ToggleSourceVisibility',
          params: {
            sceneName: obsCurrentScene,
            sourceName: item.sourceName
          }
        }
      }));
    });
    
    elObsSourcesList.appendChild(div);
  });
  
  lucide.createIcons();
}

// Boot connection
connectWebSocket();

