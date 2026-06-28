// Global State
let socket = null;
let currentProfileId = '';
let profiles = {};
let settings = {};
let spotifyUser = null;
let state = {};
let editMode = false;
let selectedButtonCell = null; // { type: 'grid'|'fav', row, col, index }
let macroSteps = []; // live macro steps being edited
let activeChatTimers = new Map(); // key: "row_col", value: intervalId
let twitchIrcConnected = false;

// Custom SVG Brand Icons with transparent background and currentColor fill
const customIcons = {
  discord: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 127.14 96.36" fill="currentColor" style="width:100%;height:100%;"><path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,67.43,67.43,0,0,1-10.5-5A52.82,52.82,0,0,0,32.32,77.3a74.19,74.19,0,0,0,62.5,0,52.82,52.82,0,0,0,4.24,3.22,67.43,67.43,0,0,1-10.5,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31-18.83c3.27-28.16-5.56-50.93-21.2-69.46ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z"/></svg>`,
  spotify: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:100%;height:100%;"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.565.387-.86.207-2.377-1.454-5.37-1.783-8.893-.982-.336.075-.668-.135-.744-.47-.077-.337.135-.668.47-.745 3.856-.88 7.15-.5 9.822 1.135.296.18.387.563.205.855zm1.224-2.724c-.227.367-.708.487-1.074.26-2.72-1.672-6.87-2.157-10.082-1.182-.413.125-.85-.107-.975-.52-.125-.413.107-.85.52-.975 3.678-1.117 8.243-.573 11.35 1.34.367.226.487.707.26 1.076zm.106-2.825C14.42 8.78 8.636 8.59 5.293 9.605c-.512.155-1.05-.133-1.206-.644-.156-.51.133-1.05.644-1.207 3.844-1.167 10.224-.952 14.254 1.442.46.273.61.87.337 1.33-.273.46-.87.61-1.33.337z"/></svg>`,
  youtube: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:100%;height:100%;"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.53 3.5 12 3.5 12 3.5s-7.53 0-9.388.555A3.003 3.003 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93.502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.47 20.5 12 20.5 12 20.5s7.53 0 9.388-.555a3.003 3.003 0 0 0 2.11-2.108C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
  obs: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:100%;height:100%;"><path d="M12,24C5.383,24,0,18.617,0,12S5.383,0,12,0s12,5.383,12,12S18.617,24,12,24z M12,1.109 C5.995,1.109,1.11,5.995,1.11,12C1.11,18.005,5.995,22.89,12,22.89S22.89,18.005,22.89,12C22.89,5.995,18.005,1.109,12,1.109z M6.182,5.99c0.352-1.698,1.503-3.229,3.05-3.996c-0.269,0.273-0.595,0.483-0.844,0.78c-1.02,1.1-1.48,2.692-1.199,4.156 c0.355,2.235,2.455,4.06,4.732,4.028c1.765,0.079,3.485-0.937,4.348-2.468c1.848,0.063,3.645,1.017,4.7,2.548 c0.54,0.799,0.962,1.736,0.991,2.711c-0.342-1.295-1.202-2.446-2.375-3.095c-1.135-0.639-2.529-0.802-3.772-0.425 c-1.56,0.448-2.849,1.723-3.293,3.293c-0.377,1.25-0.216,2.628,0.377,3.772c-0.825,1.429-2.315,2.449-3.932,2.756 c-1.244,0.261-2.551,0.059-3.709-0.464c1.036,0.302,2.161,0.355,3.191-0.011c1.381-0.457,2.522-1.567,3.024-2.935 c0.556-1.49,0.345-3.261-0.591-4.54c-0.7-1.007-1.803-1.717-3.002-1.969c-0.38-0.068-0.764-0.098-1.148-0.134 c-0.611-1.231-0.834-2.66-0.528-3.996L6.182,5.99z"/></svg>`,
  twitch: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:100%;height:100%;"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/></svg>`
};

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
const elLogoLiveDot = document.getElementById('logo-live-dot');

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
const elBtnSpotifyDisconnect = document.getElementById('btn-spotify-disconnect');
const elSpotifyProfileBox = document.getElementById('spotify-profile-box');
const elSpotifyAvatar = document.getElementById('spotify-avatar');
const elSpotifyUsername = document.getElementById('spotify-username');
const elBtnCopyRedirectUri = document.getElementById('btn-copy-redirect-uri');
const elSpotifyRedirectUriText = document.getElementById('spotify-redirect-uri-text');

const elStreamlabsHeaderStatus = document.getElementById('status-streamlabs');
const elStreamlabsStatusText = document.getElementById('streamlabs-status-text');
const elStreamlabsToken = document.getElementById('streamlabs-token');
const elStreamlabsSettingsForm = document.getElementById('streamlabs-settings-form');
const elBtnStreamlabsTest = document.getElementById('btn-streamlabs-test');
const elStreamlabsTestIcon = document.getElementById('streamlabs-test-icon');
const elStreamlabsTestFeedback = document.getElementById('streamlabs-test-feedback');

const elTwitchIrcStatusText = document.getElementById('twitch-irc-status-text');
const elBtnTwitchDisconnect = document.getElementById('btn-twitch-disconnect');
const elBtnTwitchGetToken = document.getElementById('btn-twitch-get-token');

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
const elSoundboardUnifiedGrid = document.getElementById('soundboard-unified-grid');
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
const elFieldsTwitchChat = document.getElementById('fields-twitch-chat');
const elTwitchChatMessage = document.getElementById('twitch-chat-message');
const elTwitchChatInterval = document.getElementById('twitch-chat-interval');
const elTwitchIrcConnectedBar = document.getElementById('twitch-irc-connected-bar');
const elTwitchIrcDisconnectedBar = document.getElementById('twitch-irc-disconnected-bar');
const elTwitchChatTokenInput = document.getElementById('twitch-chat-token-input');
const elTwitchIrcCfgStatus = document.getElementById('twitch-irc-cfg-status');
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
      const name = icon.toLowerCase();
      if (customIcons[name]) {
        elPreviewIconEl.innerHTML = customIcons[name];
      } else {
        elPreviewIconEl.innerHTML = `<i data-lucide="${icon}"></i>`;
        lucide.createIcons({ nodes: [elPreviewIconEl] });
      }
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
  'discord', 'spotify', 'youtube', 'obs', 'twitch',
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
    
    const name = iconName.toLowerCase();
    if (customIcons[name]) {
      el.innerHTML = customIcons[name];
    } else {
      el.innerHTML = `<i data-lucide="${iconName}"></i>`;
    }

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
    showToast('Profiles exported successfully!');
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
      if (!data.profiles) throw new Error('Invalid file: missing "profiles"');
      if (!confirm(`Import ${Object.keys(data.profiles).length} profile(s)? Current profiles will be replaced.`)) return;
      profiles = data.profiles;
      if (data.activeProfile && profiles[data.activeProfile]) {
        currentProfileId = data.activeProfile;
      }
      socket.send(JSON.stringify({ type: 'save_profiles', profiles, activeProfile: currentProfileId }));
      showToast('Profiles imported successfully!');
    } catch (err) {
      showToast(`Import error: ${err.message}`, true);
    }
    e.target.value = '';
  });
}

// -------------------------------------------------------------
// FEATURE: MACRO EXECUTION
// -------------------------------------------------------------
// TWITCH CHAT ACTION
// -------------------------------------------------------------
function executeTwitchChatAction(btnData) {
  const data = btnData.actionData || {};
  const message = data.message || '';
  const interval = parseInt(data.interval || '0', 10);
  const key = btnData._timerKey || `${btnData.row}_${btnData.col}`;

  if (!message) return;

  // If already has active timer, cancel it (toggle off)
  if (activeChatTimers.has(key)) {
    clearInterval(activeChatTimers.get(key));
    activeChatTimers.delete(key);
    showToast('Chat timer cancelled.');
    renderGrid();
    return;
  }

  // Send immediately
  sendMessage({ type: 'send_chat_message', message });
  showToast(`Sent to chat: "${message.length > 40 ? message.slice(0,40)+'…' : message}"`);

  if (interval > 0) {
    const id = setInterval(() => {
      sendMessage({ type: 'send_chat_message', message });
    }, interval * 1000);
    activeChatTimers.set(key, id);
    showToast(`Timer active: every ${interval}s — press again to cancel.`);
    renderGrid();
  }
}

function updateTwitchIrcBars() {
  if (elTwitchIrcConnectedBar) elTwitchIrcConnectedBar.style.display = twitchIrcConnected ? 'flex' : 'none';
  if (elTwitchIrcDisconnectedBar) elTwitchIrcDisconnectedBar.style.display = twitchIrcConnected ? 'none' : 'flex';

  const user = settings.twitch ? settings.twitch.username : '';

  if (elTwitchIrcStatusText) {
    if (twitchIrcConnected) {
      elTwitchIrcStatusText.textContent = `Conectado como: ${user || 'Utilizador'}`;
      elTwitchIrcStatusText.style.background = 'rgba(16,185,129,0.1)';
      elTwitchIrcStatusText.style.border = '1px solid rgba(16,185,129,0.25)';
      elTwitchIrcStatusText.style.color = '#34d399';
      elTwitchIrcStatusText.className = 'status-badge connected';
      
      if (elBtnTwitchDisconnect) elBtnTwitchDisconnect.classList.remove('hidden');
    } else {
      elTwitchIrcStatusText.textContent = 'Disconnected';
      elTwitchIrcStatusText.style.background = 'rgba(239,68,68,0.1)';
      elTwitchIrcStatusText.style.border = '1px solid rgba(239,68,68,0.25)';
      elTwitchIrcStatusText.style.color = '#f87171';
      elTwitchIrcStatusText.className = 'status-badge disconnected';
      
      if (elBtnTwitchDisconnect) elBtnTwitchDisconnect.classList.add('hidden');
    }
  }

  if (elTwitchIrcCfgStatus) {
    elTwitchIrcCfgStatus.style.display = 'block';
    if (twitchIrcConnected) {
      elTwitchIrcCfgStatus.style.background = 'rgba(16,185,129,0.1)';
      elTwitchIrcCfgStatus.style.border = '1px solid rgba(16,185,129,0.25)';
      elTwitchIrcCfgStatus.style.color = '#34d399';
      elTwitchIrcCfgStatus.textContent = '✓ Chat Twitch conectado';
    } else {
      elTwitchIrcCfgStatus.style.background = 'rgba(239,68,68,0.1)';
      elTwitchIrcCfgStatus.style.border = '1px solid rgba(239,68,68,0.25)';
      elTwitchIrcCfgStatus.style.color = '#f87171';
      elTwitchIrcCfgStatus.textContent = '✗ Chat disconnected — save settings to reconnect';
    }
  }
}

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
      try { await navigator.clipboard.writeText(step.data?.text || ''); showToast('Text copied!'); } catch(e) {}
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
          <option value="sound"${step.type==='sound'?' selected':''}>Sound</option>
          <option value="system"${step.type==='system'?' selected':''}>Sistema</option>
          <option value="nav"${step.type==='nav'?' selected':''}>Mudar Perfil</option>
          <option value="clipboard"${step.type==='clipboard'?' selected':''}>Copiar Texto</option>
        </select>
        <button class="macro-step-del" data-idx="${idx}">✕ Remove</button>
      </div>
      <div class="macro-step-params" id="macro-params-${idx}"></div>
      <div class="macro-step-delay-row">
        <span>Wait</span>
        <input type="number" class="glass-input macro-delay-input" value="${step.delay || 0}" min="0" step="100" data-idx="${idx}">
        <span>ms before this step</span>
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
      ['SetCurrentProgramScene', 'Change Scene'],
      ['ToggleInputMute', 'Toggle Mute'],
      ['ToggleStream', 'Toggle Stream'],
      ['ToggleRecord', 'Toggle Recording'],
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
      sceneSel.innerHTML = '<option value="">-- Select scene --</option>';
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
      inputSel.innerHTML = '<option value="">-- Select input --</option>';
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
    soundSel.innerHTML = '<option value="">-- Select sound --</option>';
    const synths = ['airhorn','siren','coin','laser','boom','success'];
    synths.forEach(s => {
      const o = document.createElement('option');
      o.value = s; o.textContent = `Synth: ${s}`;
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
    navSel.innerHTML = '<option value="">-- Select profile --</option>';
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
function sendMessage(obj) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(obj));
  }
}

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
    showToast('Connected to server!');
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
        spotifyUser = msg.spotifyUser;
        
        // Sync connection state & UI
        updateObsStatus(msg.obsConnected, msg.obsCurrentScene, msg.obsMuteStates, msg.obsStreamState, msg.obsRecordState);
        obsScenes = msg.obsScenes || [];
        obsInputs = msg.obsInputs || [];
        obsActiveSceneItems = msg.obsActiveSceneItems || [];
        twitchIrcConnected = !!msg.twitchChatConnected;
        updateTwitchIrcBars();
        if (elStreamlabsHeaderStatus) {
          elStreamlabsHeaderStatus.className = `status-indicator ${msg.streamlabsConnected ? 'connected' : 'disconnected'}`;
        }
        updateStreamlabsStatusUI(!!msg.streamlabsConnected);

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
        checkFirstSetupStatus();
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
        spotifyUser = msg.spotifyUser !== undefined ? msg.spotifyUser : spotifyUser;
        showToast('Settings updated!');
        populateObsSettingsForm();
        populateSpotifyForm();
        populateStreamlabsForm();
        populateTwitchSettingsForm();
        if (typeof updateWizObsStatusUI === 'function') {
          updateWizObsStatusUI();
          updateWizTwitchStatusUI();
          updateWizSpotifyStatusUI();
          updateWizStreamlabsStatusUI();
        }
        break;

      case 'twitch_irc_status':
        twitchIrcConnected = !!msg.connected;
        updateTwitchIrcBars();
        if (typeof updateWizTwitchStatusUI === 'function') {
          updateWizTwitchStatusUI();
        }
        if (msg.connected) {
          showToast('Twitch chat connected!');
        } else if (msg.error) {
          showToast(`Twitch chat: ${msg.error}`, true);
        }
        break;

      case 'obs_status':
        updateObsStatus(msg.connected, msg.currentScene, msg.muteStates, msg.streamState, msg.recordState);
        if (typeof updateWizObsStatusUI === 'function') {
          updateWizObsStatusUI();
        }
        if (msg.connected) {
          obsScenes = msg.scenes || [];
          obsInputs = msg.inputs || [];
          obsActiveSceneItems = msg.sources || [];
          populateEditorDropdowns();
          renderObsControlPanel();
          renderObsActiveSceneSources();
          showToast('Connected to OBS Studio!');
        } else {
          obsActiveSceneItems = [];
          renderObsControlPanel();
          renderObsActiveSceneSources();
          if (msg.error) {
            showToast(`OBS connection error: ${msg.error}`, true);
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

      case 'streamlabs_status':
        if (elStreamlabsHeaderStatus) {
          elStreamlabsHeaderStatus.className = `status-indicator ${msg.connected ? 'connected' : 'disconnected'}`;
        }
        updateStreamlabsStatusUI(!!msg.connected);
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
function populateSpotifyForm() {
  if (elSpotifyRedirectUriText) {
    elSpotifyRedirectUriText.textContent = (window.location.origin + '/callback').replace('localhost', '127.0.0.1');
  }
  
  if (settings.spotify) {
    elSpotifyClientId.value = settings.spotify.client_id || '';
    elSpotifyClientSecret.value = settings.spotify.client_secret || '';
    
    const isConnected = !!settings.spotify.refresh_token;
    
    if (elSpotifyStatus) {
      if (isConnected) {
        elSpotifyStatus.classList.remove('disconnected');
        elSpotifyStatus.classList.add('connected');
      } else {
        elSpotifyStatus.classList.remove('connected');
        elSpotifyStatus.classList.add('disconnected');
      }
    }
    
    if (elSpotifyStatusText) {
      if (isConnected) {
        elSpotifyStatusText.textContent = 'Conectado';
        elSpotifyStatusText.style.background = 'rgba(16,185,129,0.1)';
        elSpotifyStatusText.style.border = '1px solid rgba(16,185,129,0.25)';
        elSpotifyStatusText.style.color = '#34d399';
        elSpotifyStatusText.className = 'status-badge connected';
      } else {
        elSpotifyStatusText.textContent = 'Disconnected';
        elSpotifyStatusText.style.background = 'rgba(239,68,68,0.1)';
        elSpotifyStatusText.style.border = '1px solid rgba(239,68,68,0.25)';
        elSpotifyStatusText.style.color = '#f87171';
        elSpotifyStatusText.className = 'status-badge disconnected';
      }
    }
    
    if (isConnected) {
      elBtnSpotifyAuth.classList.add('hidden');
      if (elBtnSpotifyDisconnect) elBtnSpotifyDisconnect.classList.remove('hidden');
      
      if (spotifyUser && elSpotifyProfileBox) {
        elSpotifyProfileBox.classList.remove('hidden');
        if (elSpotifyAvatar) elSpotifyAvatar.src = spotifyUser.images?.[0]?.url || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
        if (elSpotifyUsername) elSpotifyUsername.textContent = spotifyUser.display_name || spotifyUser.id || 'Spotify User';
      } else if (elSpotifyProfileBox) {
        elSpotifyProfileBox.classList.add('hidden');
      }
    } else {
      if (elSpotifyProfileBox) elSpotifyProfileBox.classList.add('hidden');
      if (elBtnSpotifyDisconnect) elBtnSpotifyDisconnect.classList.add('hidden');
      
      if (settings.spotify.client_id && settings.spotify.client_secret) {
        elBtnSpotifyAuth.classList.remove('hidden');
      } else {
        elBtnSpotifyAuth.classList.add('hidden');
      }
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
      showToast('Credenciais Spotify gravadas!');
      settings.spotify.client_id = client_id;
      settings.spotify.client_secret = client_secret;
      populateSpotifyForm();
    } else {
      showToast('Erro ao gravar credenciais.', true);
    }
  } catch (err) {
    showToast('Erro no pedido.', true);
  }
});

elBtnSpotifyAuth.addEventListener('click', () => {
  window.open('/login', 'Spotify Login', 'width=600,height=600');
});

if (elBtnSpotifyDisconnect) {
  elBtnSpotifyDisconnect.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to disconnect Spotify and clear credentials?')) return;
    try {
      const response = await fetch('/api/spotify/disconnect', { method: 'POST' });
      const result = await response.json();
      if (result.success) {
        showToast('Spotify disconnected successfully!');
        settings.spotify.client_id = '';
        settings.spotify.client_secret = '';
        settings.spotify.access_token = '';
        settings.spotify.refresh_token = '';
        spotifyUser = null;
        populateSpotifyForm();
      } else {
        showToast('Error disconnecting.', true);
      }
    } catch (err) {
      showToast('Network error.', true);
    }
  });
}

if (elBtnCopyRedirectUri) {
  elBtnCopyRedirectUri.addEventListener('click', () => {
    const uriText = elSpotifyRedirectUriText?.textContent || (window.location.origin + '/callback');
    navigator.clipboard.writeText(uriText).then(() => {
      showToast('Redirect URI copied to clipboard!');
    }).catch(() => {
      showToast('Failed to copy.', true);
    });
  });
}

// -------------------------------------------------------------
// STREAMLABS FRONTEND LOGIC
// -------------------------------------------------------------
function populateStreamlabsForm() {
  if (settings.streamlabs) {
    elStreamlabsToken.value = settings.streamlabs.token || '';
    
    const isConnected = elStreamlabsHeaderStatus && elStreamlabsHeaderStatus.classList.contains('connected');
    updateStreamlabsStatusUI(isConnected);
  }
}

function updateStreamlabsStatusUI(connected) {
  if (elStreamlabsStatusText) {
    if (connected) {
      elStreamlabsStatusText.textContent = 'Alerts Connected';
      elStreamlabsStatusText.style.background = 'rgba(16,185,129,0.1)';
      elStreamlabsStatusText.style.border = '1px solid rgba(16,185,129,0.25)';
      elStreamlabsStatusText.style.color = '#34d399';
      elStreamlabsStatusText.className = 'status-badge connected';
    } else {
      elStreamlabsStatusText.textContent = 'Alerts Disconnected';
      elStreamlabsStatusText.style.background = 'rgba(239,68,68,0.1)';
      elStreamlabsStatusText.style.border = '1px solid rgba(239,68,68,0.25)';
      elStreamlabsStatusText.style.color = '#f87171';
      elStreamlabsStatusText.className = 'status-badge disconnected';
    }
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
      showToast('Streamlabs token saved!');
      settings.streamlabs.token = token;
      populateStreamlabsForm();
    } else {
      showToast('Error saving token.', true);
    }
  } catch (err) {
    showToast('Request error.', true);
  }
});

if (elBtnStreamlabsTest) {
  elBtnStreamlabsTest.addEventListener('click', async () => {
    const token = elStreamlabsToken.value.trim();
    if (!token) {
      showToast('Please enter a token before testing.', true);
      return;
    }
    
    elBtnStreamlabsTest.disabled = true;
    if (elStreamlabsTestIcon) elStreamlabsTestIcon.classList.add('fa-spin');
    if (elStreamlabsTestFeedback) {
      elStreamlabsTestFeedback.style.display = 'block';
      elStreamlabsTestFeedback.style.background = 'rgba(255,255,255,0.05)';
      elStreamlabsTestFeedback.style.border = '1px solid var(--border-glass)';
      elStreamlabsTestFeedback.style.color = '#fff';
      elStreamlabsTestFeedback.textContent = 'Checking Streamlabs connection...';
    }
    
    try {
      const response = await fetch('/api/streamlabs/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      const result = await response.json();
      
      if (elStreamlabsTestFeedback) {
        if (result.success) {
          elStreamlabsTestFeedback.style.background = 'rgba(16,185,129,0.1)';
          elStreamlabsTestFeedback.style.border = '1px solid rgba(16,185,129,0.25)';
          elStreamlabsTestFeedback.style.color = '#34d399';
          elStreamlabsTestFeedback.textContent = '✓ Connection established successfully!';
          showToast('Streamlabs test successful!');
        } else {
          elStreamlabsTestFeedback.style.background = 'rgba(239,68,68,0.1)';
          elStreamlabsTestFeedback.style.border = '1px solid rgba(239,68,68,0.25)';
          elStreamlabsTestFeedback.style.color = '#f87171';
          elStreamlabsTestFeedback.textContent = `✗ Connection failed: ${result.error || 'Invalid token'}`;
          showToast('Streamlabs test failed!', true);
        }
      }
    } catch (err) {
      if (elStreamlabsTestFeedback) {
        elStreamlabsTestFeedback.style.background = 'rgba(239,68,68,0.1)';
        elStreamlabsTestFeedback.style.border = '1px solid rgba(239,68,68,0.25)';
        elStreamlabsTestFeedback.style.color = '#f87171';
        elStreamlabsTestFeedback.textContent = '✗ Error testing connection.';
      }
      showToast('Error testing connection.', true);
    } finally {
      elBtnStreamlabsTest.disabled = false;
      if (elStreamlabsTestIcon) elStreamlabsTestIcon.classList.remove('fa-spin');
    }
  });
}

// -------------------------------------------------------------
// LIVE STREAM STATS & TEST ALERTS LOGIC
// -------------------------------------------------------------
function updateTwitchStats(twitchData) {
  if (!twitchData) return;
  elViewerCountInput.value = twitchData.viewerCount || 0;
  elIsLiveCheckbox.checked = twitchData.isLive || false;

  elTwitchFollower.textContent = twitchData.latestFollower || 'None';
  elTwitchSubscriber.textContent = twitchData.latestSub || 'None';
  if (twitchData.latestDonation) {
    elTwitchDonation.textContent = `${twitchData.latestDonation.name} (${twitchData.latestDonation.amount})`;
  } else {
    elTwitchDonation.textContent = 'None';
  }

  // Update top live badge + logo dot
  if (twitchData.isLive) {
    elStreamBadge.classList.remove('hidden');
    if (elLogoLiveDot) elLogoLiveDot.style.display = 'block';
  } else {
    elStreamBadge.classList.add('hidden');
    if (elLogoLiveDot) elLogoLiveDot.style.display = 'none';
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
      body: JSON.stringify({ viewer_count: viewerCount, is_live: isLive })
    });
    const result = await response.json();
    if (result.success) showToast('Stream status updated!');
  } catch (err) {
    showToast('Request error.', true);
  }
});

const elTwitchCredentialsForm = document.getElementById('twitch-credentials-form');
if (elTwitchCredentialsForm) {
  elTwitchCredentialsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const twitchUsername = elTwitchUsernameInput?.value.trim() || '';
    const chatToken = elTwitchChatTokenInput?.value.trim() || '';
    const newSettings = {
      ...settings,
      twitch: { ...(settings.twitch || {}), username: twitchUsername, chatToken }
    };
    sendMessage({ type: 'save_settings', settings: newSettings });
    showToast('Twitch credentials saved!');
  });
}

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
      showToast('Test alert fired!');
      elTestAlertName.value = '';
      elTestAlertMessage.value = '';
    }
  } catch (err) {
    showToast('Error firing test alert.', true);
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
    details = alertData.message || 'Followed!';
  } else if (alertData.alertType === 'sub') {
    labelType = `SUB ${alertData.tier || 'TIER 1'}`;
    details = alertData.message || 'Sub!';
  } else if (alertData.alertType === 'donation') {
    labelType = alertData.amount || 'DONATION';
    details = alertData.message || 'Donated!';
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
    elObsScenesList.innerHTML = '<div class="empty-state">Disconnected from OBS. Enable OBS WebSocket server.</div>';
    elObsAudioInputsList.innerHTML = '<div class="empty-state">Disconnected from OBS.</div>';
    elActiveSceneName.textContent = 'Disconnected';
    return;
  }

  // Active scene title
  elActiveSceneName.textContent = obsCurrentScene || 'None';

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
    elObsAudioInputsList.innerHTML = '<div class="empty-state">No audio channels available in OBS.</div>';
  } else {
    obsInputs.forEach(inputName => {
      const isMuted = obsMuteStates[inputName];
      const item = document.createElement('div');
      item.className = 'obs-audio-channel';
      item.innerHTML = `
        <span class="obs-channel-name">${inputName}</span>
        <button class="mute-btn ${isMuted ? 'active-muted' : ''}">
          <i data-lucide="${isMuted ? 'mic-off' : 'mic'}"></i> ${isMuted ? 'MUTED' : 'ACTIVE'}
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
    elDeckGrid.innerHTML = '<div class="empty-state">No Stream Deck profile selected.</div>';
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
          const overlay = document.createElement('div');
          overlay.className = 'deck-btn-img-overlay';
          const hex = btnData.color || '#000000';
          overlay.style.background = hex;
          overlay.style.opacity = '0.45';
          btn.appendChild(overlay);
        } else if (btnData.icon) {
          const iconDiv = document.createElement('div');
          iconDiv.className = 'deck-btn-icon';
          const name = btnData.icon.toLowerCase();
          if (customIcons[name]) {
            iconDiv.innerHTML = customIcons[name];
          } else {
            iconDiv.innerHTML = `<i data-lucide="${btnData.icon}"></i>`;
          }
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

        // Twitch chat timer indicator
        if (btnData.actionType === 'twitch_chat') {
          const timerKey = `grid_${r}_${c}`;
          if (activeChatTimers.has(timerKey)) {
            btn.classList.add('chat-timer-active');
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
        const hex = favData.color || '#000000';
        slot.innerHTML = `
          <div class="deck-btn-img-overlay" style="background:${hex};opacity:0.45;position:absolute;inset:0;border-radius:inherit;z-index:1;pointer-events:none;"></div>
          <div class="deck-btn-label" style="position:relative;z-index:2;text-shadow:0 1px 4px rgba(0,0,0,0.8);">${favData.label || ''}</div>
        `;
      } else {
        const iconName = (favData.icon || 'star').toLowerCase();
        let iconContent = '';
        if (customIcons[iconName]) {
          iconContent = customIcons[iconName];
        } else {
          iconContent = `<i data-lucide="${favData.icon || 'star'}"></i>`;
        }
        slot.innerHTML = `
          <div class="deck-btn-icon">${iconContent}</div>
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
      slot.innerHTML = `<span>Favorite ${idx+1}</span>`;
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
    executeAction({ ...btnData, _timerKey: `grid_${row}_${col}` });
  }
}

function handleFavoriteClick(index, favData) {
  if (editMode) {
    selectedButtonCell = { type: 'fav', index };
    openEditorDrawer(-1, -1, favData);
    renderFavorites();
  } else if (favData) {
    executeAction({ ...favData, _timerKey: `fav_${index}` });
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
    navigator.clipboard.writeText(text).then(() => showToast('Text copied!')).catch(() => showToast('Copy error', true));
  } else if (btnData.actionType === 'twitch_chat') {
    executeTwitchChatAction(btnData);
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
    elEditorRow.textContent = 'Favorite';
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
  if (elTwitchChatMessage) elTwitchChatMessage.value = '';
  if (elTwitchChatInterval) elTwitchChatInterval.value = '0';
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
    } else if (btnData.actionType === 'twitch_chat') {
      if (elTwitchChatMessage) elTwitchChatMessage.value = data.message || '';
      if (elTwitchChatInterval) elTwitchChatInterval.value = data.interval || 0;
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
    showToast('Only image files are accepted.', true);
    return;
  }

  const formData = new FormData();
  formData.append('image', file);
  showToast('Uploading image...');

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
      showToast('Image uploaded successfully!');
      updateLivePreview();
    } else {
      showToast(`Upload failed: ${result.error}`, true);
    }
  } catch (err) {
    showToast('Error uploading image.', true);
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
  elFieldsTwitchChat?.classList.add('hidden');
  elFieldsMacro?.classList.add('hidden');

  if (type === 'obs') elFieldsObs.classList.remove('hidden');
  else if (type === 'system') elFieldsSystem.classList.remove('hidden');
  else if (type === 'nav') elFieldsNav.classList.remove('hidden');
  else if (type === 'sound') elFieldsSound.classList.remove('hidden');
  else if (type === 'clipboard') elFieldsClipboard?.classList.remove('hidden');
  else if (type === 'twitch_chat') {
    elFieldsTwitchChat?.classList.remove('hidden');
    updateTwitchIrcBars();
  }
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
  elObsSceneSelect.innerHTML = '<option value="">-- Select Scene --</option>';
  obsScenes.forEach(scene => {
    const opt = document.createElement('option');
    opt.value = scene;
    opt.textContent = scene;
    elObsSceneSelect.appendChild(opt);
  });

  // Input select
  elObsInputSelect.innerHTML = '<option value="">-- Select Input --</option>';
  obsInputs.forEach(input => {
    const opt = document.createElement('option');
    opt.value = input;
    opt.textContent = input;
    elObsInputSelect.appendChild(opt);
  });

  // Nav profile target select
  elNavTargetProfile.innerHTML = '<option value="">-- Select Profile --</option>';
  Object.keys(profiles).forEach(pId => {
    const opt = document.createElement('option');
    opt.value = pId;
    opt.textContent = profiles[pId].name;
    elNavTargetProfile.appendChild(opt);
  });

  // OBS Toggle Source Scene Select
  elObsSourceSceneSelect.innerHTML = '<option value="">-- Active Scene / Auto-detect --</option>';
  obsScenes.forEach(scene => {
    const opt = document.createElement('option');
    opt.value = scene;
    opt.textContent = scene;
    elObsSourceSceneSelect.appendChild(opt);
  });

  // OBS Toggle Source Name Select
  elObsSourceNameSelect.innerHTML = '<option value="">-- Select Source --</option>';
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
      actionData = { command, params };
    } else if (command === 'ToggleInputMute') {
      params = { inputName: elObsInputText.value.trim() };
      actionData = { command, params };
    } else if (command === 'ToggleSourceVisibility') {
      params = {
        sceneName: elObsSourceSceneText.value.trim(),
        sourceName: elObsSourceNameText.value.trim()
      };
      actionData = { command, params };
    } else if (command === 'Custom') {
      try {
        params = JSON.parse(elObsCustomParams.value || '{}');
      } catch(e) {
        showToast('Invalid JSON in OBS custom params', true);
        return;
      }
      actionData = {
        command: 'Custom',
        customRequest: elObsCustomRequest.value.trim(),
        params
      };
    } else {
      actionData = { command, params };
    }
  } else if (actionType === 'system') {
    actionData = { command: elSystemCmd.value.trim() };
  } else if (actionType === 'nav') {
    actionData = { targetProfile: elNavTargetProfile.value };
  } else if (actionType === 'sound') {
    actionData = { file: elSoundSelect.value };
  } else if (actionType === 'clipboard') {
    actionData = { text: elClipboardText?.value || '' };
  } else if (actionType === 'twitch_chat') {
    const msg = elTwitchChatMessage?.value?.trim() || '';
    if (!msg) { showToast('Enter a chat message!', true); return; }
    actionData = { message: msg, interval: parseInt(elTwitchChatInterval?.value || '0', 10) || 0 };
  } else if (actionType === 'macro') {
    if (macroSteps.length === 0) {
      showToast('Add at least one step to the macro!', true);
      return;
    }
    actionData = { steps: JSON.parse(JSON.stringify(macroSteps)) };
  }

  const hasVisual = label || image || icon;
  const btnData = (actionType !== 'none' || hasVisual)
    ? {
        label, icon, image, color, iconColor, textColor, glowColor, colSpan, rowSpan,
        ...(actionType !== 'none' ? { actionType, actionData } : {})
      }
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
  const name = prompt("New profile name:");
  if (!name || name.trim() === '') return;
  
  const id = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  if (profiles[id]) {
    showToast('This profile already exists!', true);
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
      showToast(`Spotify error: ${res.error || 'Unknown error'}`, true);
    }
  } catch (err) {
    showToast('Spotify control error', true);
  }
}

function updateSpotifyPlaystate(spotifyState) {
  const isSpotifyConnected = settings && settings.spotify && !!settings.spotify.refresh_token;

  if (isSpotifyConnected) {
    elSpotifyStatus.classList.remove('disconnected');
    elSpotifyStatus.classList.add('connected');
  } else {
    elSpotifyStatus.classList.remove('connected');
    elSpotifyStatus.classList.add('disconnected');
  }

  if (spotifyState && spotifyState.title) {
    // Show current track details (whether playing or paused)
    elSpotifyTrack.textContent = spotifyState.title;
    elSpotifyArtist.textContent = spotifyState.artist;
    elSpotifyTimeTotal.textContent = spotifyState.durationStr;

    if (spotifyState.isPlaying) {
      if (elSpotifyStatusText) {
        elSpotifyStatusText.textContent = `Playing: ${spotifyState.title} - ${spotifyState.artist}`;
        elSpotifyStatusText.className = "status-badge connected";
      }
      elSpotifyBtnPlayPause.innerHTML = '<i data-lucide="pause"></i>';
      elSpotifyArt.classList.add('spinning');
    } else {
      if (elSpotifyStatusText) {
        elSpotifyStatusText.textContent = `Paused: ${spotifyState.title} - ${spotifyState.artist}`;
        elSpotifyStatusText.className = "status-badge connected";
      }
      elSpotifyBtnPlayPause.innerHTML = '<i data-lucide="play"></i>';
      elSpotifyArt.classList.remove('spinning');
    }
    
    if (spotifyState.albumArt) {
      elSpotifyArt.style.backgroundImage = `url(${spotifyState.albumArt})`;
      elSpotifyArt.innerHTML = '';
    } else {
      elSpotifyArt.style.backgroundImage = '';
      elSpotifyArt.innerHTML = '<i data-lucide="music"></i>';
    }

    // Sync progress timeline
    localSpotifyProgress = parseProgressStringToMs(spotifyState.progressStr);
    const totalMs = parseProgressStringToMs(spotifyState.durationStr);
    updateSpotifyProgressUI(localSpotifyProgress, totalMs);

    if (spotifyState.isPlaying) {
      startSpotifyLocalProgressTimer(totalMs);
    } else {
      stopSpotifyLocalProgressTimer();
    }
  } else {
    if (elSpotifyStatusText) {
      if (isSpotifyConnected) {
        elSpotifyStatusText.textContent = "Conectado / Sem reprodução";
        elSpotifyStatusText.className = "status-badge connected";
      } else {
        elSpotifyStatusText.textContent = "Nothing playing";
        elSpotifyStatusText.className = "status-badge disconnected";
      }
    }

    // Clean interactive card
    elSpotifyTrack.textContent = "Nothing playing";
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
  const synths = ['airhorn','siren','coin','laser','boom','success','drumroll','rimshot','notification','level_up','sad_trombone','fanfare','error','chime','heartbeat','powerup','sub_alert','glitch'];
  if (synths.includes(soundName)) {
    triggerLocalSynthSound(soundName);
  } else {
    const src = soundName.startsWith('/uploads') ? soundName : `/uploads/${soundName}`;
    const audio = new Audio(src);
    audio.play().catch(err => {
      console.warn('Error playing audio:', err);
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
    osc.start(now); osc.stop(now + 1.15);

  } else if (type === 'drumroll') {
    const now = audioCtx.currentTime;
    for (let i = 0; i < 12; i++) {
      const t = now + i * 0.07;
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.connect(g); g.connect(audioCtx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(80 + Math.random() * 30, t);
      g.gain.setValueAtTime(0.12, t);
      g.gain.linearRampToValueAtTime(0.01, t + 0.06);
      osc.start(t); osc.stop(t + 0.07);
    }

  } else if (type === 'rimshot') {
    const now = audioCtx.currentTime;
    [200, 250].forEach(freq => {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.connect(g); g.connect(audioCtx.destination);
      osc.type = 'square'; osc.frequency.setValueAtTime(freq, now);
      g.gain.setValueAtTime(0.15, now); g.gain.linearRampToValueAtTime(0.01, now + 0.12);
      osc.start(now); osc.stop(now + 0.12);
    });
    const osc2 = audioCtx.createOscillator();
    const g2 = audioCtx.createGain();
    osc2.connect(g2); g2.connect(audioCtx.destination);
    osc2.type = 'sine'; osc2.frequency.setValueAtTime(440, now + 0.15);
    osc2.frequency.exponentialRampToValueAtTime(220, now + 0.55);
    g2.gain.setValueAtTime(0.18, now + 0.15); g2.gain.linearRampToValueAtTime(0.01, now + 0.55);
    osc2.start(now + 0.15); osc2.stop(now + 0.55);

  } else if (type === 'notification') {
    const now = audioCtx.currentTime;
    [880, 1108, 1318].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.connect(g); g.connect(audioCtx.destination);
      osc.type = 'sine'; osc.frequency.setValueAtTime(freq, now + i * 0.1);
      g.gain.setValueAtTime(0.12, now + i * 0.1); g.gain.linearRampToValueAtTime(0.01, now + i * 0.1 + 0.15);
      osc.start(now + i * 0.1); osc.stop(now + i * 0.1 + 0.15);
    });

  } else if (type === 'level_up') {
    const now = audioCtx.currentTime;
    [261, 329, 392, 523, 659, 784].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.connect(g); g.connect(audioCtx.destination);
      osc.type = 'square'; osc.frequency.setValueAtTime(freq, now + i * 0.07);
      g.gain.setValueAtTime(0.1, now + i * 0.07); g.gain.linearRampToValueAtTime(0.01, now + i * 0.07 + 0.09);
      osc.start(now + i * 0.07); osc.stop(now + i * 0.07 + 0.1);
    });

  } else if (type === 'sad_trombone') {
    const now = audioCtx.currentTime;
    const notes = [466, 415, 370, 330];
    notes.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.connect(g); g.connect(audioCtx.destination);
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(freq, now + i * 0.18);
      g.gain.setValueAtTime(0.15, now + i * 0.18); g.gain.linearRampToValueAtTime(0.01, now + i * 0.18 + 0.25);
      osc.start(now + i * 0.18); osc.stop(now + i * 0.18 + 0.28);
    });

  } else if (type === 'fanfare') {
    const now = audioCtx.currentTime;
    const seq = [[523,0],[659,0.1],[784,0.2],[1047,0.35],[784,0.5],[1047,0.65]];
    seq.forEach(([freq, t]) => {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.connect(g); g.connect(audioCtx.destination);
      osc.type = 'triangle'; osc.frequency.setValueAtTime(freq, now + t);
      g.gain.setValueAtTime(0.18, now + t); g.gain.linearRampToValueAtTime(0.01, now + t + 0.18);
      osc.start(now + t); osc.stop(now + t + 0.2);
    });

  } else if (type === 'error') {
    const now = audioCtx.currentTime;
    [220, 200].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.connect(g); g.connect(audioCtx.destination);
      osc.type = 'square'; osc.frequency.setValueAtTime(freq, now + i * 0.2);
      g.gain.setValueAtTime(0.18, now + i * 0.2); g.gain.linearRampToValueAtTime(0.01, now + i * 0.2 + 0.18);
      osc.start(now + i * 0.2); osc.stop(now + i * 0.2 + 0.2);
    });

  } else if (type === 'chime') {
    const now = audioCtx.currentTime;
    [1318, 1568, 2093].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.connect(g); g.connect(audioCtx.destination);
      osc.type = 'sine'; osc.frequency.setValueAtTime(freq, now + i * 0.12);
      g.gain.setValueAtTime(0.14, now + i * 0.12); g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.5);
      osc.start(now + i * 0.12); osc.stop(now + i * 0.12 + 0.5);
    });

  } else if (type === 'heartbeat') {
    const now = audioCtx.currentTime;
    [0, 0.35].forEach(offset => {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.connect(g); g.connect(audioCtx.destination);
      osc.type = 'sine'; osc.frequency.setValueAtTime(80, now + offset);
      osc.frequency.linearRampToValueAtTime(40, now + offset + 0.12);
      g.gain.setValueAtTime(0.3, now + offset); g.gain.linearRampToValueAtTime(0.01, now + offset + 0.15);
      osc.start(now + offset); osc.stop(now + offset + 0.15);
    });

  } else if (type === 'powerup') {
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.connect(g); g.connect(audioCtx.destination);
    const now = audioCtx.currentTime;
    osc.type = 'square';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.6);
    g.gain.setValueAtTime(0.15, now); g.gain.linearRampToValueAtTime(0.01, now + 0.6);
    osc.start(now); osc.stop(now + 0.6);

  } else if (type === 'sub_alert') {
    const now = audioCtx.currentTime;
    const seq = [[523,0],[784,0.08],[1046,0.16],[1318,0.26],[1046,0.38],[1318,0.5]];
    seq.forEach(([freq, t]) => {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.connect(g); g.connect(audioCtx.destination);
      osc.type = 'sine'; osc.frequency.setValueAtTime(freq, now + t);
      g.gain.setValueAtTime(0.15, now + t); g.gain.linearRampToValueAtTime(0.01, now + t + 0.1);
      osc.start(now + t); osc.stop(now + t + 0.12);
    });

  } else if (type === 'glitch') {
    const now = audioCtx.currentTime;
    for (let i = 0; i < 8; i++) {
      const t = now + i * 0.04;
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.connect(g); g.connect(audioCtx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100 + Math.random() * 800, t);
      g.gain.setValueAtTime(0.1, t); g.gain.linearRampToValueAtTime(0.01, t + 0.035);
      osc.start(t); osc.stop(t + 0.04);
    }
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
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const sounds = await response.json();
    customSounds = sounds;

    if (elSoundboardUnifiedGrid) {
      elSoundboardUnifiedGrid.innerHTML = '';

      // Append custom and synthetic sounds dynamically
      sounds.forEach(sound => {
        const wrapper = document.createElement('div');
        wrapper.className = 'custom-sound-wrapper';

        // Play button styled like synthetic/custom ones
        const btn = document.createElement('button');
        if (sound.isSynth) {
          btn.className = 'soundboard-btn synth-effect';
          const iconName = sound.icon || 'wind';
          btn.innerHTML = `<i data-lucide="${iconName}"></i> <span class="sound-name-label">${sound.name}</span>`;
        } else {
          btn.className = 'soundboard-btn custom-effect';
          btn.innerHTML = `<i data-lucide="music"></i> <span class="sound-name-label">${sound.name}</span>`;
        }
        btn.setAttribute('data-sound', sound.id);

        // Click to play
        btn.addEventListener('click', () => {
          socket.send(JSON.stringify({
            type: 'trigger_action',
            actionType: 'sound',
            actionData: { file: sound.id }
          }));
        });

        // Hover actions overlay
        const actions = document.createElement('div');
        actions.className = 'custom-sound-actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'sound-mini-btn edit';
        editBtn.title = 'Rename';
        editBtn.innerHTML = '<i data-lucide="pencil"></i>';
        editBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const newName = prompt('Enter the new name for the sound:', sound.name);
          if (newName && newName.trim() !== '' && newName.trim() !== sound.name) {
            renameCustomSound(sound.id, newName.trim(), wrapper.querySelector('.sound-name-label'));
          }
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'sound-mini-btn delete';
        deleteBtn.title = 'Delete/Hide';
        deleteBtn.innerHTML = '<i data-lucide="trash-2"></i>';
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const confirmMsg = sound.isSynth 
            ? `Do you want to hide the original sound "${sound.name}"?` 
            : `Do you want to delete the uploaded sound "${sound.name}"?`;
          if (confirm(confirmMsg)) {
            deleteCustomSound(sound.id, wrapper);
          }
        });

        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        wrapper.appendChild(btn);
        wrapper.appendChild(actions);
        elSoundboardUnifiedGrid.appendChild(wrapper);
      });
    }

    populateDrawerSoundSelect();
    lucide.createIcons();
  } catch (err) {
    console.error('Error loading custom sounds:', err);
    showToast('Error loading custom sounds.', true);
  }
}

async function renameCustomSound(id, newName, labelEl) {
  try {
    const r = await fetch(`/api/soundboard/sounds/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName: newName })
    });
    const result = await r.json();
    if (result.success) {
      labelEl.textContent = newName;
      showToast('Sound renamed!');
      
      const match = customSounds.find(s => s.id === id);
      if (match) match.name = newName;

      populateDrawerSoundSelect();
    } else {
      showToast('Error renaming sound.', true);
    }
  } catch (err) {
    showToast('Connection error.', true);
  }
}

async function deleteCustomSound(id, wrapperEl) {
  try {
    const r = await fetch(`/api/soundboard/sounds/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    const result = await r.json();
    if (result.success) {
      wrapperEl.remove();
      showToast('Sound removed!');
      
      customSounds = customSounds.filter(s => s.id !== id);

      populateDrawerSoundSelect();
    } else {
      showToast('Error removing sound.', true);
    }
  } catch (err) {
    showToast('Connection error.', true);
  }
}

function populateDrawerSoundSelect() {
  if (!elSoundSelect) return;
  elSoundSelect.innerHTML = '<option value="">-- Select Sound --</option>';

  customSounds.forEach(sound => {
    const opt = document.createElement('option');
    opt.value = sound.id;
    opt.textContent = sound.isSynth ? `Synth: ${sound.name}` : `Uploaded Sound: ${sound.name}`;
    elSoundSelect.appendChild(opt);
  });
}

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
  
  showToast('Uploading audio...');
  try {
    const response = await fetch('/api/soundboard/upload', {
      method: 'POST',
      body: formData
    });
    const result = await response.json();
    if (result.success) {
      showToast('Audio uploaded successfully!');
      loadSoundboardCustomSounds();
    } else {
      showToast(`Upload failed: ${result.error}`, true);
    }
  } catch (err) {
    showToast('Error uploading audio', true);
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
    showToast('Profile name cannot be empty', true);
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
  showToast('Profile updated!');
});

elBtnDeleteProfile.addEventListener('click', () => {
  const keys = Object.keys(profiles);
  if (keys.length <= 1) {
    showToast('Cannot delete the only existing profile!', true);
    return;
  }
  
  if (!confirm(`Delete profile "${profiles[currentProfileId].name}"?`)) {
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
  showToast('Profile deleted!');
});

// -------------------------------------------------------------
// TWITCH INTEGRATION & MODERATION PANEL
// -------------------------------------------------------------
function populateTwitchSettingsForm() {
  const user = settings.twitch ? settings.twitch.username : '';
  elTwitchUsernameInput.value = user;
  if (elTwitchChatTokenInput) elTwitchChatTokenInput.value = settings.twitch?.chatToken || '';
  updateTwitchIrcBars();
  
  if (user) {
    elTwitchChatIframe.src = `https://www.twitch.tv/embed/${user}/chat?parent=${window.location.hostname}&darkpopout`;
    elChatNoUserMessage.classList.add('hidden');
    if (elTwitchModviewLink) elTwitchModviewLink.href = `https://twitch.tv/moderator/${user}`;
  } else {
    elTwitchChatIframe.src = '';
    elChatNoUserMessage.classList.remove('hidden');
    if (elTwitchModviewLink) elTwitchModviewLink.href = '#';
  }
}

// Event listeners for Twitch config enhancements
if (elBtnTwitchGetToken) {
  elBtnTwitchGetToken.addEventListener('click', () => {
    window.open('https://twitchtokengenerator.com/', 'Twitch Token Generator', 'width=600,height=600');
  });
}

if (elBtnTwitchDisconnect) {
  elBtnTwitchDisconnect.addEventListener('click', async () => {
    if (!confirm('Do you want to disconnect your Twitch account?')) return;
    try {
      const response = await fetch('/api/twitch/disconnect', { method: 'POST' });
      const result = await response.json();
      if (result.success) {
        showToast('Twitch successfully disconnected!');
        settings.twitch.username = '';
        settings.twitch.chatToken = '';
        twitchIrcConnected = false;
        populateTwitchSettingsForm();
      } else {
        showToast('Error disconnecting.', true);
      }
    } catch (err) {
      showToast('Error contacting the server.', true);
    }
  });
}

function sendChatModAction(action) {
  const user = settings.twitch ? settings.twitch.username : '';
  if (!user) {
    showToast('Twitch username not configured!', true);
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
    showToast(`Command "${commandStr}" copied! Paste in chat.`);
  }).catch(() => {
    showToast(`Command: "${commandStr}"`, false);
  });
}

elBtnModClear.addEventListener('click', () => sendChatModAction('clear'));
elBtnModSubonly.addEventListener('click', () => sendChatModAction('subonly'));
elBtnModSubonlyoff.addEventListener('click', () => sendChatModAction('subonlyoff'));
elBtnModEmoteonly.addEventListener('click', () => sendChatModAction('emoteonly'));
elBtnModEmoteonlyoff.addEventListener('click', () => sendChatModAction('emoteonlyoff'));
elBtnModCommercial.addEventListener('click', () => sendChatModAction('commercial'));

// New mod buttons
document.getElementById('btn-mod-slow30')?.addEventListener('click', () => copyModCmd('/slow 30'));
document.getElementById('btn-mod-slow60')?.addEventListener('click', () => copyModCmd('/slow 60'));
document.getElementById('btn-mod-slow120')?.addEventListener('click', () => copyModCmd('/slow 120'));
document.getElementById('btn-mod-slowoff')?.addEventListener('click', () => copyModCmd('/slowoff'));
document.getElementById('btn-mod-followers')?.addEventListener('click', () => copyModCmd('/followers'));
document.getElementById('btn-mod-followers10')?.addEventListener('click', () => copyModCmd('/followers 10'));
document.getElementById('btn-mod-followers30')?.addEventListener('click', () => copyModCmd('/followers 30'));
document.getElementById('btn-mod-followersoff')?.addEventListener('click', () => copyModCmd('/followersoff'));
document.getElementById('btn-mod-commercial60')?.addEventListener('click', () => copyModCmd('/commercial 60'));
document.getElementById('btn-mod-commercial90')?.addEventListener('click', () => copyModCmd('/commercial 90'));

document.getElementById('btn-mod-timeout')?.addEventListener('click', () => {
  const user = document.getElementById('mod-target-user')?.value.trim().replace(/^@/, '');
  if (!user) { showToast('Enter the username!', true); return; }
  copyModCmd(`/timeout ${user} 600`);
});
document.getElementById('btn-mod-timeout-1h')?.addEventListener('click', () => {
  const user = document.getElementById('mod-target-user')?.value.trim().replace(/^@/, '');
  if (!user) { showToast('Enter the username!', true); return; }
  copyModCmd(`/timeout ${user} 3600`);
});
document.getElementById('btn-mod-ban')?.addEventListener('click', () => {
  const user = document.getElementById('mod-target-user')?.value.trim().replace(/^@/, '');
  if (!user) { showToast('Enter the username!', true); return; }
  copyModCmd(`/ban ${user}`);
});
document.getElementById('btn-mod-unban')?.addEventListener('click', () => {
  const user = document.getElementById('mod-target-user')?.value.trim().replace(/^@/, '');
  if (!user) { showToast('Enter the username!', true); return; }
  copyModCmd(`/unban ${user}`);
});
document.getElementById('btn-mod-raid')?.addEventListener('click', () => {
  const target = document.getElementById('mod-raid-target')?.value.trim().replace(/^@/, '');
  if (!target) { showToast('Enter the target channel!', true); return; }
  copyModCmd(`/raid ${target}`);
});

function copyModCmd(cmd) {
  navigator.clipboard.writeText(cmd).then(() => {
    showToast(`Copied: ${cmd} — paste in chat!`);
  }).catch(() => showToast(`Command: ${cmd}`, false));
}

// -------------------------------------------------------------
// OBS SCENE SOURCE VISIBILITY MANAGEMENT
// -------------------------------------------------------------
function renderObsActiveSceneSources() {
  if (!obsConnected) {
    elObsSourcesList.innerHTML = '<div class="empty-state">Disconnected from OBS. Enable OBS WebSocket server.</div>';
    return;
  }

  elObsSourcesList.innerHTML = '';
  if (obsActiveSceneItems.length === 0) {
    elObsSourcesList.innerHTML = '<div class="empty-state">No sources available in this scene.</div>';
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
      <button class="obs-source-visibility-btn ${isVisible ? 'visible' : ''}" title="Toggle Visibility">
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


// -------------------------------------------------------------
// FIRST SETUP WIZARD FRONTEND LOGIC
// -------------------------------------------------------------
let wizCurrentStep = 1;

const elWizModal = document.getElementById('setup-wizard-modal');
const elWizStepIndicators = document.querySelectorAll('.wizard-step-indicator');
const elWizStepContents = document.querySelectorAll('.wizard-step-content');
const elWizBtnPrev = document.getElementById('wiz-btn-prev');
const elWizBtnSkip = document.getElementById('wiz-btn-skip');
const elWizBtnNext = document.getElementById('wiz-btn-next');

// Step 2: OBS
const elWizObsPort = document.getElementById('wiz-obs-port');
const elWizObsPassword = document.getElementById('wiz-obs-password');
const elWizBtnObsSave = document.getElementById('wiz-btn-obs-save');
const elWizObsStatus = document.getElementById('wiz-obs-status');

// Step 3: Twitch
const elWizTwitchUsername = document.getElementById('wiz-twitch-username');
const elWizTwitchToken = document.getElementById('wiz-twitch-token');
const elWizBtnTwitchToken = document.getElementById('wiz-btn-twitch-token');
const elWizBtnTwitchSave = document.getElementById('wiz-btn-twitch-save');
const elWizTwitchStatus = document.getElementById('wiz-twitch-status');

// Step 4: Spotify
const elWizSpotifyId = document.getElementById('wiz-spotify-id');
const elWizSpotifySecret = document.getElementById('wiz-spotify-secret');
const elWizSpotifyRedirectUri = document.getElementById('wiz-spotify-redirect-uri');
const elWizBtnCopyUri = document.getElementById('wiz-btn-copy-uri');
const elWizBtnSpotifySave = document.getElementById('wiz-btn-spotify-save');
const elWizBtnSpotifyAuth = document.getElementById('wiz-btn-spotify-auth');
const elWizSpotifyStatus = document.getElementById('wiz-spotify-status');

// Step 5: Streamlabs
const elWizStreamlabsToken = document.getElementById('wiz-streamlabs-token');
const elWizBtnStreamlabsSave = document.getElementById('wiz-btn-streamlabs-save');
const elWizBtnStreamlabsTest = document.getElementById('wiz-btn-streamlabs-test');
const elWizStreamlabsStatus = document.getElementById('wiz-streamlabs-status');

function checkFirstSetupStatus() {
  if (settings && settings.firstSetupCompleted === false) {
    if (elWizModal) {
      elWizModal.classList.remove('hidden');
      updateWizUI();
      
      // Update dynamic redirect uri
      if (elWizSpotifyRedirectUri) {
        elWizSpotifyRedirectUri.textContent = (window.location.origin + '/callback').replace('localhost', '127.0.0.1');
      }
    }
  } else {
    if (elWizModal) elWizModal.classList.add('hidden');
  }
}

function updateWizUI() {
  // Show active content, hide others
  elWizStepContents.forEach((c, idx) => {
    if (idx + 1 === wizCurrentStep) {
      c.classList.remove('hidden');
    } else {
      c.classList.add('hidden');
    }
  });

  // Update indicators
  elWizStepIndicators.forEach((ind, idx) => {
    const stepNum = idx + 1;
    if (stepNum === wizCurrentStep) {
      ind.classList.add('active');
      ind.style.color = 'var(--neon-cyan)';
      ind.style.borderBottomColor = 'var(--neon-cyan)';
    } else if (stepNum < wizCurrentStep) {
      ind.classList.remove('active');
      ind.style.color = '#34d399'; // green for completed
      ind.style.borderBottomColor = '#34d399';
    } else {
      ind.classList.remove('active');
      ind.style.color = 'var(--text-dim)';
      ind.style.borderBottomColor = 'transparent';
    }
  });

  // Update buttons
  if (wizCurrentStep === 1) {
    elWizBtnPrev.style.display = 'none';
    elWizBtnSkip.style.display = 'block';
    elWizBtnNext.textContent = 'Start';
  } else if (wizCurrentStep === 5) {
    elWizBtnPrev.style.display = 'block';
    elWizBtnSkip.style.display = 'none';
    elWizBtnNext.textContent = 'Finish Setup';
  } else {
    elWizBtnPrev.style.display = 'block';
    elWizBtnSkip.style.display = 'block';
    elWizBtnNext.textContent = 'Next';
  }

  // Populate fields if settings loaded
  if (settings) {
    if (wizCurrentStep === 2) {
      elWizObsPort.value = settings.obs?.port || '4455';
      elWizObsPassword.value = settings.obs?.password || '';
      updateWizObsStatusUI();
    }
    if (wizCurrentStep === 3) {
      elWizTwitchUsername.value = settings.twitch?.username || '';
      elWizTwitchToken.value = settings.twitch?.chatToken || '';
      updateWizTwitchStatusUI();
    }
    if (wizCurrentStep === 4) {
      elWizSpotifyId.value = settings.spotify?.client_id || '';
      elWizSpotifySecret.value = settings.spotify?.client_secret || '';
      updateWizSpotifyStatusUI();
    }
    if (wizCurrentStep === 5) {
      elWizStreamlabsToken.value = settings.streamlabs?.token || '';
      updateWizStreamlabsStatusUI();
    }
  }
}

function updateWizObsStatusUI() {
  if (!elWizObsStatus) return;
  if (obsConnected) {
    elWizObsStatus.textContent = '✓ OBS Connected';
    elWizObsStatus.style.background = 'rgba(16,185,129,0.1)';
    elWizObsStatus.style.borderColor = 'rgba(16,185,129,0.25)';
    elWizObsStatus.style.color = '#34d399';
  } else {
    elWizObsStatus.textContent = '✗ OBS Disconnected';
    elWizObsStatus.style.background = 'rgba(239,68,68,0.1)';
    elWizObsStatus.style.borderColor = 'rgba(239,68,68,0.25)';
    elWizObsStatus.style.color = '#f87171';
  }
}

function updateWizTwitchStatusUI() {
  if (!elWizTwitchStatus) return;
  if (twitchIrcConnected) {
    elWizTwitchStatus.textContent = '✓ Twitch Chat Connected';
    elWizTwitchStatus.style.background = 'rgba(16,185,129,0.1)';
    elWizTwitchStatus.style.borderColor = 'rgba(16,185,129,0.25)';
    elWizTwitchStatus.style.color = '#34d399';
  } else {
    elWizTwitchStatus.textContent = '✗ Twitch Chat Disconnected';
    elWizTwitchStatus.style.background = 'rgba(239,68,68,0.1)';
    elWizTwitchStatus.style.borderColor = 'rgba(239,68,68,0.25)';
    elWizTwitchStatus.style.color = '#f87171';
  }
}

function updateWizSpotifyStatusUI() {
  if (!elWizSpotifyStatus) return;
  const isConnected = !!settings.spotify?.refresh_token;
  if (isConnected) {
    elWizSpotifyStatus.textContent = '✓ Spotify Connected';
    elWizSpotifyStatus.style.background = 'rgba(16,185,129,0.1)';
    elWizSpotifyStatus.style.borderColor = 'rgba(16,185,129,0.25)';
    elWizSpotifyStatus.style.color = '#34d399';
    elWizBtnSpotifyAuth.classList.add('hidden');
  } else {
    elWizSpotifyStatus.textContent = '✗ Spotify Disconnected';
    elWizSpotifyStatus.style.background = 'rgba(239,68,68,0.1)';
    elWizSpotifyStatus.style.borderColor = 'rgba(239,68,68,0.25)';
    elWizSpotifyStatus.style.color = '#f87171';
    if (settings.spotify?.client_id && settings.spotify?.client_secret) {
      elWizBtnSpotifyAuth.classList.remove('hidden');
    } else {
      elWizBtnSpotifyAuth.classList.add('hidden');
    }
  }
}

function updateWizStreamlabsStatusUI() {
  if (!elWizStreamlabsStatus) return;
  const isConnected = !!(settings.streamlabs?.token && elStreamlabsHeaderStatus && elStreamlabsHeaderStatus.classList.contains('connected'));
  if (isConnected) {
    elWizStreamlabsStatus.textContent = '✓ Streamlabs Alerts Connected';
    elWizStreamlabsStatus.style.background = 'rgba(16,185,129,0.1)';
    elWizStreamlabsStatus.style.borderColor = 'rgba(16,185,129,0.25)';
    elWizStreamlabsStatus.style.color = '#34d399';
  } else {
    elWizStreamlabsStatus.textContent = '✗ Streamlabs Alerts Disconnected';
    elWizStreamlabsStatus.style.background = 'rgba(239,68,68,0.1)';
    elWizStreamlabsStatus.style.borderColor = 'rgba(239,68,68,0.25)';
    elWizStreamlabsStatus.style.color = '#f87171';
  }
}

// Navigation event listeners
if (elWizBtnPrev) {
  elWizBtnPrev.addEventListener('click', () => {
    if (wizCurrentStep > 1) {
      wizCurrentStep--;
      updateWizUI();
    }
  });
}

async function finishSetupWizard() {
  try {
    const response = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstSetupCompleted: true })
    });
    const result = await response.json();
    if (result.success) {
      settings.firstSetupCompleted = true;
      if (elWizModal) elWizModal.classList.add('hidden');
      showToast('Configuration completed successfully! Welcome.');
    }
  } catch (err) {
    showToast('Error finishing setup.', true);
  }
}

if (elWizBtnSkip) {
  elWizBtnSkip.addEventListener('click', () => {
    if (confirm('Do you want to skip the initial configuration? You can set up connections later.')) {
      finishSetupWizard();
    }
  });
}

if (elWizBtnNext) {
  elWizBtnNext.addEventListener('click', () => {
    if (wizCurrentStep < 5) {
      wizCurrentStep++;
      updateWizUI();
    } else {
      finishSetupWizard();
    }
  });
}

// Step 2: OBS Actions
if (elWizBtnObsSave) {
  elWizBtnObsSave.addEventListener('click', async () => {
    const port = elWizObsPort.value.trim();
    const password = elWizObsPassword.value;
    
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          obs_port: port,
          obs_password: password
        })
      });
      const result = await response.json();
      if (result.success) {
        showToast('OBS credentials saved! Attempting to connect...');
        settings.obs.port = port;
        settings.obs.password = password;
      }
    } catch (err) {
      showToast('Error saving OBS settings.', true);
    }
  });
}

// Step 3: Twitch Actions
if (elWizBtnTwitchToken) {
  elWizBtnTwitchToken.addEventListener('click', () => {
    window.open('https://twitchtokengenerator.com/', 'Twitch Token Generator', 'width=600,height=600');
  });
}

if (elWizBtnTwitchSave) {
  elWizBtnTwitchSave.addEventListener('click', async () => {
    const username = elWizTwitchUsername.value.trim();
    const token = elWizTwitchToken.value.trim();
    
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          twitch_username: username,
          twitch_token: token
        })
      });
      const result = await response.json();
      if (result.success) {
        showToast('Twitch configuration saved! Connecting chat...');
        if (!settings.twitch) settings.twitch = {};
        settings.twitch.username = username;
        settings.twitch.chatToken = token;
      }
    } catch (err) {
      showToast('Error saving Twitch configuration.', true);
    }
  });
}

// Step 4: Spotify Actions
if (elWizBtnCopyUri) {
  elWizBtnCopyUri.addEventListener('click', () => {
    const uriText = elWizSpotifyRedirectUri?.textContent || (window.location.origin + '/callback');
    navigator.clipboard.writeText(uriText).then(() => {
      showToast('Redirect URI copied to clipboard!');
    }).catch(() => {
      showToast('Failed to copy.', true);
    });
  });
}

if (elWizBtnSpotifySave) {
  elWizBtnSpotifySave.addEventListener('click', async () => {
    const id = elWizSpotifyId.value.trim();
    const secret = elWizSpotifySecret.value.trim();
    
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spotify_client_id: id,
          spotify_client_secret: secret
        })
      });
      const result = await response.json();
      if (result.success) {
        showToast('Spotify credentials saved!');
        settings.spotify.client_id = id;
        settings.spotify.client_secret = secret;
        updateWizSpotifyStatusUI();
      }
    } catch (err) {
      showToast('Error saving Spotify credentials.', true);
    }
  });
}

if (elWizBtnSpotifyAuth) {
  elWizBtnSpotifyAuth.addEventListener('click', () => {
    window.open('/login', 'Spotify Login', 'width=600,height=600');
  });
}

// Step 5: Streamlabs Actions
if (elWizBtnStreamlabsSave) {
  elWizBtnStreamlabsSave.addEventListener('click', async () => {
    const token = elWizStreamlabsToken.value.trim();
    
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
        showToast('Streamlabs token saved!');
        settings.streamlabs.token = token;
        updateWizStreamlabsStatusUI();
      }
    } catch (err) {
      showToast('Error saving Streamlabs token.', true);
    }
  });
}

if (elWizBtnStreamlabsTest) {
  elWizBtnStreamlabsTest.addEventListener('click', async () => {
    const token = elWizStreamlabsToken.value.trim();
    if (!token) {
      showToast('Please enter a token before testing.', true);
      return;
    }
    
    elWizBtnStreamlabsTest.disabled = true;
    elWizBtnStreamlabsTest.textContent = 'Testing...';
    
    try {
      const response = await fetch('/api/streamlabs/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      const result = await response.json();
      if (result.success) {
        showToast('Streamlabs connection established successfully!');
        updateWizStreamlabsStatusUI();
      } else {
        showToast(`Test error: ${result.error || 'Invalid token'}`, true);
      }
    } catch (err) {
      showToast('Network error while testing.', true);
    } finally {
      elWizBtnStreamlabsTest.disabled = false;
      elWizBtnStreamlabsTest.textContent = 'Test Connection';
    }
  });
}

