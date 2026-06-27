import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import open from 'open';
import { exec } from 'child_process';
import os from 'os';
import { OBSWebSocket } from 'obs-websocket-js';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const CONFIG_DIR = path.join(__dirname, 'config');
const SETTINGS_PATH = path.join(CONFIG_DIR, 'settings.json');
const PROFILES_PATH = path.join(CONFIG_DIR, 'profiles.json');
const STATE_PATH = path.join(CONFIG_DIR, 'state.json');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

// Ensure directories exist
try {
  await fs.mkdir(CONFIG_DIR, { recursive: true });
} catch (err) {}
try {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
} catch (err) {}

// Config Loaders/Savers
async function loadJson(filePath, defaults) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.log(`[Config] Creating default for ${path.basename(filePath)}`);
    await saveJson(filePath, defaults);
    return defaults;
  }
}

async function saveJson(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`[Config] Error saving ${path.basename(filePath)}:`, err);
    return false;
  }
}

// Default Configuration Templates
const defaultSettings = {
  obs: {
    host: "localhost",
    port: "4455",
    password: "",
    autoConnect: true
  },
  spotify: {
    client_id: "",
    client_secret: "",
    access_token: "",
    refresh_token: ""
  },
  streamlabs: {
    token: ""
  },
  server: {
    port: 3000
  },
  twitch: {
    username: "SAMUCA2835"
  }
};

const defaultProfiles = {
  activeProfile: "obs_control",
  profiles: {
    obs_control: {
      id: "obs_control",
      name: "🎥 OBS Control",
      rows: 3,
      cols: 5,
      buttons: {},
      favorites: [null, null, null, null, null]
    }
  }
};

const defaultState = {
  latest_follower: "PixelHoodRat420",
  latest_sub: "PixelHoodRat420",
  latest_donation: {
    name: "HoodSmoker69",
    amount: "R$ 10,00",
    message: "vai lá mano, kk!"
  },
  viewer_count: 0,
  is_live: false
};

// Global configs and states
let settingsConfig = await loadJson(SETTINGS_PATH, defaultSettings);
let profilesConfig = await loadJson(PROFILES_PATH, defaultProfiles);
let stateConfig = await loadJson(STATE_PATH, defaultState);

// Express and Server setup
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Global state
let currentSpotifyState = {
  title: 'Nenhuma música tocando',
  artist: 'Spotify',
  progressStr: '0:00',
  durationStr: '0:00',
  progressPercent: 0,
  albumArt: '',
  isPlaying: false
};

let streamlabsWs = null;
let spotifyInterval = null;

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const fileExt = path.extname(file.originalname);
    const fileName = path.basename(file.originalname, fileExt)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_');
    cb(null, `${fileName}_${Date.now()}${fileExt}`);
  }
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// OBS Client Setup
const obs = new OBSWebSocket();
let obsConnected = false;
let obsCurrentScene = '';
let obsMuteStates = {};
let obsStreamState = 'UNKNOWN';
let obsRecordState = 'UNKNOWN';
let obsScenes = [];
let obsInputs = [];
let obsActiveSceneItems = [];

// Broadcast message helper to all WebSockets
function broadcast(message) {
  const payload = JSON.stringify(message);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

// -------------------------------------------------------------
// SPOTIFY POLLING LOOP
// -------------------------------------------------------------
async function pollSpotify() {
  if (!settingsConfig.spotify.refresh_token || !settingsConfig.spotify.client_id || !settingsConfig.spotify.client_secret) {
    return;
  }

  try {
    let accessToken = settingsConfig.spotify.access_token;
    
    // Check Spotify API
    let response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    // Handle token refresh
    if (response.status === 401) {
      console.log('[Spotify] Access token expired, refreshing...');
      accessToken = await refreshSpotifyToken();
      if (!accessToken) return;
      
      // Retry
      response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
    }

    if (response.status === 204) {
      if (currentSpotifyState.isPlaying) {
        currentSpotifyState = {
          ...currentSpotifyState,
          isPlaying: false
        };
        broadcast({ type: 'spotify', data: currentSpotifyState });
      }
      return;
    }

    if (!response.ok) {
      throw new Error(`Spotify API status ${response.status}`);
    }

    const data = await response.json();
    if (!data || !data.item) return;

    const msToMinSec = (ms) => {
      const min = Math.floor(ms / 60000);
      const sec = Math.floor((ms % 60000) / 1000);
      return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    const newState = {
      title: data.item.name,
      artist: data.item.artists.map(a => a.name).join(', '),
      progressStr: msToMinSec(data.progress_ms),
      durationStr: msToMinSec(data.item.duration_ms),
      progressPercent: Math.min(100, Math.floor((data.progress_ms / data.item.duration_ms) * 100)),
      albumArt: data.item.album.images[0]?.url || '',
      isPlaying: data.is_playing
    };

    if (JSON.stringify(newState) !== JSON.stringify(currentSpotifyState)) {
      currentSpotifyState = newState;
      broadcast({ type: 'spotify', data: currentSpotifyState });
    }

  } catch (err) {
    console.error('[Spotify] Polling error:', err.message);
  }
}

async function refreshSpotifyToken() {
  try {
    const { client_id, client_secret, refresh_token } = settingsConfig.spotify;
    const creds = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${creds}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      })
    });

    if (!response.ok) {
      throw new Error(`Refresh failed: ${response.status}`);
    }

    const data = await response.json();
    settingsConfig.spotify.access_token = data.access_token;
    if (data.refresh_token) {
      settingsConfig.spotify.refresh_token = data.refresh_token;
    }
    await saveJson(SETTINGS_PATH, settingsConfig);
    console.log('[Spotify] Token refreshed successfully.');
    return data.access_token;
  } catch (err) {
    console.error('[Spotify] Token refresh error:', err.message);
    return null;
  }
}

function startSpotifyPoll() {
  if (spotifyInterval) clearInterval(spotifyInterval);
  spotifyInterval = setInterval(pollSpotify, 1500);
}

// -------------------------------------------------------------
// STREAMLABS SOCKET
// -------------------------------------------------------------
async function connectStreamlabs() {
  const token = settingsConfig.streamlabs.token;
  if (!token) {
    console.log('[Streamlabs] No Socket Token configured. Alerts will run in manual mode.');
    return;
  }

  if (streamlabsWs) {
    streamlabsWs.terminate();
  }

  const wsUrl = `wss://sockets.streamlabs.com/socket.io/?token=${token}&EIO=3&transport=websocket`;
  console.log('[Streamlabs] Connecting to Streamlabs WebSocket...');
  
  const ws = new WebSocket(wsUrl);
  streamlabsWs = ws;

  ws.on('open', () => {
    console.log('[Streamlabs] Connected successfully to Streamlabs!');
  });

  ws.on('message', async (rawData) => {
    const message = rawData.toString();
    
    // Ping/Pong
    if (message === '2') {
      ws.send('3');
      return;
    }

    if (message.startsWith('42')) {
      try {
        const payload = JSON.parse(message.substring(2));
        const eventName = payload[0];
        const eventData = payload[1];

        if (eventName === 'event') {
          await handleStreamlabsEvent(eventData);
        }
      } catch (err) {
        console.error('[Streamlabs] Error parsing event packet:', err);
      }
    }
  });

  ws.on('close', (code, reason) => {
    console.warn(`[Streamlabs] Connection closed: ${code} - ${reason}. Reconnecting in 10s...`);
    setTimeout(connectStreamlabs, 10000);
  });

  ws.on('error', (err) => {
    console.error('[Streamlabs] WebSocket error:', err.message);
    ws.close();
  });
}

async function handleStreamlabsEvent(eventData) {
  const type = eventData.type; // follow, subscription, donation, etc.
  const msgArray = eventData.message;
  if (!msgArray || !msgArray.length) return;

  const mainMsg = msgArray[0];
  const name = mainMsg.name || 'Anonymous';
  const customMessage = mainMsg.message || '';

  console.log(`[Streamlabs] Received ${type} alert for: ${name}`);

  if (type === 'follow') {
    stateConfig.latest_follower = name;
    await saveJson(STATE_PATH, stateConfig);
    broadcast({
      type: 'twitch',
      data: {
        viewerCount: stateConfig.viewer_count,
        isLive: stateConfig.is_live,
        latestFollower: name,
        latestSub: stateConfig.latest_sub,
        latestDonation: stateConfig.latest_donation
      }
    });
    broadcast({
      type: 'alert',
      data: {
        alertType: 'follow',
        name: name,
        message: customMessage || 'BORA BORA!'
      }
    });
  } else if (type === 'subscription' || type === 'resub') {
    stateConfig.latest_sub = name;
    await saveJson(STATE_PATH, stateConfig);
    
    const tier = mainMsg.sub_plan === '3000' ? 'TIER 3' : (mainMsg.sub_plan === '2000' ? 'TIER 2' : 'TIER 1');
    broadcast({
      type: 'twitch',
      data: {
        viewerCount: stateConfig.viewer_count,
        isLive: stateConfig.is_live,
        latestFollower: stateConfig.latest_follower,
        latestSub: name,
        latestDonation: stateConfig.latest_donation
      }
    });
    broadcast({
      type: 'alert',
      data: {
        alertType: 'sub',
        name: name,
        message: customMessage || 'MUITO GRATO, MANO!',
        tier: tier
      }
    });
  } else if (type === 'donation') {
    const formattedAmount = mainMsg.formatted_amount || `R$ ${parseFloat(mainMsg.amount).toFixed(2)}`;
    stateConfig.latest_donation = {
      name: name,
      amount: formattedAmount,
      message: customMessage
    };
    await saveJson(STATE_PATH, stateConfig);
    
    broadcast({
      type: 'twitch',
      data: {
        viewerCount: stateConfig.viewer_count,
        isLive: stateConfig.is_live,
        latestFollower: stateConfig.latest_follower,
        latestSub: stateConfig.latest_sub,
        latestDonation: stateConfig.latest_donation
      }
    });
    broadcast({
      type: 'alert',
      data: {
        alertType: 'donation',
        name: name,
        message: customMessage || 'VALEU DEMAIS, TROPA!',
        amount: formattedAmount
      }
    });
  }
}

// -------------------------------------------------------------
// OBS WEBSOCKETS
// -------------------------------------------------------------
async function fetchActiveSceneSources() {
  if (!obsConnected || !obsCurrentScene) return;
  try {
    const response = await obs.call('GetSceneItemList', { sceneName: obsCurrentScene });
    obsActiveSceneItems = response.sceneItems.map(item => ({
      itemId: item.sceneItemId,
      sourceName: item.sourceName,
      sourceType: item.sourceType,
      inputKind: item.inputKind,
      enabled: item.sceneItemEnabled
    }));
  } catch (err) {
    console.error('Error fetching active scene sources:', err.message);
    obsActiveSceneItems = [];
  }
}

async function fetchObsDetails() {
  if (!obsConnected) return;
  try {
    const sceneData = await obs.call('GetCurrentProgramScene');
    obsCurrentScene = sceneData.currentProgramSceneName;

    const scenesData = await obs.call('GetSceneList');
    obsScenes = scenesData.scenes.map(s => s.sceneName);

    const streamStatus = await obs.call('GetStreamStatus');
    obsStreamState = streamStatus.outputActive ? 'STREAM_STARTED' : 'STREAM_STOPPED';

    const recordStatus = await obs.call('GetRecordStatus');
    obsRecordState = recordStatus.outputActive ? 'RECORD_STARTED' : 'RECORD_STOPPED';

    const inputsData = await obs.call('GetInputList');
    obsInputs = [];
    obsMuteStates = {};
    for (const input of inputsData.inputs) {
      if (
        input.inputKind.includes('wasapi') ||
        input.inputKind.includes('audio') ||
        input.inputKind.includes('mic')
      ) {
        obsInputs.push(input.inputName);
        try {
          const muteData = await obs.call('GetInputMute', { inputName: input.inputName });
          obsMuteStates[input.inputName] = muteData.inputMuted;
        } catch (e) {
          // ignore if mute not supported
        }
      }
    }

    await fetchActiveSceneSources();
  } catch (err) {
    console.error('Error fetching OBS details:', err);
  }
}

async function connectToObs() {
  const { host, port, password } = settingsConfig.obs;
  const url = `ws://${host}:${port}`;
  console.log(`Connecting to OBS WebSocket at ${url}...`);

  try {
    await obs.connect(url, password || undefined, {
      rpcVersion: 1,
      eventSubscriptions: 0xffff
    });
    obsConnected = true;
    console.log('Successfully connected to OBS WebSocket!');
    await fetchObsDetails();
    broadcast({
      type: 'obs_status',
      connected: true,
      currentScene: obsCurrentScene,
      muteStates: obsMuteStates,
      streamState: obsStreamState,
      recordState: obsRecordState,
      scenes: obsScenes,
      inputs: obsInputs,
      sources: obsActiveSceneItems
    });
  } catch (err) {
    console.error('Failed to connect to OBS:', err.message);
    obsConnected = false;
    broadcast({ type: 'obs_status', connected: false, error: err.message });
  }
}

// OBS Event Bindings
obs.on('ConnectionOpened', () => {
  console.log('OBS WebSocket connection opened');
});

obs.on('ConnectionClosed', (error) => {
  console.log('OBS WebSocket connection closed:', error?.message || 'No error details');
  obsConnected = false;
  obsCurrentScene = '';
  obsMuteStates = {};
  obsStreamState = 'UNKNOWN';
  obsRecordState = 'UNKNOWN';
  obsScenes = [];
  obsInputs = [];
  broadcast({ type: 'obs_status', connected: false, error: error?.message || 'Disconnected' });
});

obs.on('ConnectionError', (error) => {
  console.error('OBS Connection Error:', error);
  obsConnected = false;
  broadcast({ type: 'obs_status', connected: false, error: error.message || 'Connection Error' });
});

obs.on('CurrentProgramSceneChanged', async (data) => {
  obsCurrentScene = data.sceneName;
  await fetchActiveSceneSources();
  broadcast({
    type: 'obs_event',
    eventName: 'CurrentProgramSceneChanged',
    eventData: { sceneName: data.sceneName }
  });
  broadcast({
    type: 'obs_scene_sources',
    sceneName: obsCurrentScene,
    sources: obsActiveSceneItems
  });
});

obs.on('SceneItemEnableStateChanged', (data) => {
  if (data.sceneName === obsCurrentScene) {
    const item = obsActiveSceneItems.find(i => i.itemId === data.sceneItemId);
    if (item) {
      item.enabled = data.sceneItemEnabled;
    }
    broadcast({
      type: 'obs_scene_sources',
      sceneName: obsCurrentScene,
      sources: obsActiveSceneItems
    });
  }
});

obs.on('SceneItemCreated', async (data) => {
  if (data.sceneName === obsCurrentScene) {
    await fetchActiveSceneSources();
    broadcast({
      type: 'obs_scene_sources',
      sceneName: obsCurrentScene,
      sources: obsActiveSceneItems
    });
  }
});

obs.on('SceneItemRemoved', async (data) => {
  if (data.sceneName === obsCurrentScene) {
    await fetchActiveSceneSources();
    broadcast({
      type: 'obs_scene_sources',
      sceneName: obsCurrentScene,
      sources: obsActiveSceneItems
    });
  }
});

obs.on('InputMuteStateChanged', (data) => {
  obsMuteStates[data.inputName] = data.inputMuted;
  broadcast({
    type: 'obs_event',
    eventName: 'InputMuteStateChanged',
    eventData: { inputName: data.inputName, inputMuted: data.inputMuted }
  });
});

obs.on('StreamStateChanged', (data) => {
  let state = data.outputState;
  if (state === 'OBS_WEBSOCKET_OUTPUT_STARTING') state = 'STREAM_STARTING';
  else if (state === 'OBS_WEBSOCKET_OUTPUT_STARTED') state = 'STREAM_STARTED';
  else if (state === 'OBS_WEBSOCKET_OUTPUT_STOPPING') state = 'STREAM_STOPPING';
  else if (state === 'OBS_WEBSOCKET_OUTPUT_STOPPED') state = 'STREAM_STOPPED';
  obsStreamState = state;
  broadcast({
    type: 'obs_event',
    eventName: 'StreamStateChanged',
    eventData: { outputState: state }
  });
});

obs.on('RecordStateChanged', (data) => {
  let state = data.outputState;
  if (state === 'OBS_WEBSOCKET_OUTPUT_STARTING') state = 'RECORD_STARTING';
  else if (state === 'OBS_WEBSOCKET_OUTPUT_STARTED') state = 'RECORD_STARTED';
  else if (state === 'OBS_WEBSOCKET_OUTPUT_STOPPING') state = 'RECORD_STOPPING';
  else if (state === 'OBS_WEBSOCKET_OUTPUT_STOPPED') state = 'RECORD_STOPPED';
  else if (state === 'OBS_WEBSOCKET_OUTPUT_PAUSED') state = 'RECORD_PAUSED';
  else if (state === 'OBS_WEBSOCKET_OUTPUT_RESUMED') state = 'RECORD_STARTED';
  obsRecordState = state;
  broadcast({
    type: 'obs_event',
    eventName: 'RecordStateChanged',
    eventData: { outputState: state }
  });
});

obs.on('SceneListChanged', async () => {
  await fetchObsDetails();
  broadcast({
    type: 'obs_details',
    scenes: obsScenes,
    inputs: obsInputs
  });
});

obs.on('InputListChanged', async () => {
  await fetchObsDetails();
  broadcast({
    type: 'obs_details',
    scenes: obsScenes,
    inputs: obsInputs
  });
});

// Action Runner for Stream Deck
async function handleAction(type, actionData, ws) {
  if (!actionData) return;
  console.log(`Executing action: Type=${type}`, actionData);

  if (type === 'obs') {
    if (!obsConnected) {
      ws.send(JSON.stringify({ type: 'error', message: 'OBS is not connected!' }));
      return;
    }
    try {
      if (actionData.command === 'ToggleSourceVisibility') {
        const { sceneName, sourceName } = actionData.params;
        const response = await obs.call('GetSceneItemList', { sceneName });
        const item = response.sceneItems.find(i => i.sourceName === sourceName);
        if (!item) {
          throw new Error(`Fonte '${sourceName}' não encontrada na cena '${sceneName}'`);
        }
        await obs.call('SetSceneItemEnabled', {
          sceneName,
          sceneItemId: item.sceneItemId,
          sceneItemEnabled: !item.sceneItemEnabled
        });
      } else {
        await obs.call(actionData.command, actionData.params || {});
      }
    } catch (err) {
      console.error(`OBS command error (${actionData.command}):`, err.message);
      ws.send(JSON.stringify({ type: 'error', message: `OBS Error: ${err.message}` }));
    }
  } else if (type === 'system') {
    const command = actionData.command;
    if (!command || command.trim() === '') {
      ws.send(JSON.stringify({ type: 'error', message: 'No system command specified' }));
      return;
    }
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`System command execution error:`, error);
        ws.send(JSON.stringify({
          type: 'error',
          message: `Failed to launch: ${error.message}`
        }));
        return;
      }
      if (stderr) console.warn(`System command stderr:`, stderr);
    });
  } else if (type === 'sound') {
    const file = actionData.file;
    broadcast({
      type: 'play_sound',
      sound: file
    });
  } else {
    console.log(`Action type ${type} handled client-side.`);
  }
}

// -------------------------------------------------------------
// WEBSOCKET CLIENTS ROUTING
// -------------------------------------------------------------
wss.on('connection', async (ws) => {
  console.log('[WebSocket] Client connected');

  // 1. Send Deck Configuration and OBS data
  ws.send(JSON.stringify({
    type: 'init_data',
    profiles: profilesConfig.profiles,
    activeProfile: profilesConfig.activeProfile,
    settings: settingsConfig,
    obsConnected,
    obsCurrentScene,
    obsMuteStates,
    obsStreamState,
    obsRecordState,
    obsScenes,
    obsInputs,
    obsActiveSceneItems
  }));

  // 2. Send Spotify current playback state (for overlays/dashboard)
  ws.send(JSON.stringify({ type: 'spotify', data: currentSpotifyState }));

  // 3. Send live stats state (for overlays/dashboard)
  ws.send(JSON.stringify({
    type: 'twitch',
    data: {
      viewerCount: stateConfig.viewer_count,
      isLive: stateConfig.is_live,
      latestFollower: stateConfig.latest_follower,
      latestSub: stateConfig.latest_sub,
      latestDonation: stateConfig.latest_donation
    }
  }));

  ws.on('message', async (message) => {
    let data;
    try {
      data = JSON.parse(message);
    } catch (e) {
      console.error('[WebSocket] Invalid JSON:', message);
      return;
    }

    switch (data.type) {
      case 'init':
        // Re-send status
        ws.send(JSON.stringify({
          type: 'init_data',
          profiles: profilesConfig.profiles,
          activeProfile: profilesConfig.activeProfile,
          settings: settingsConfig,
          obsConnected,
          obsCurrentScene,
          obsMuteStates,
          obsStreamState,
          obsRecordState,
          obsScenes,
          obsInputs,
          obsActiveSceneItems
        }));
        ws.send(JSON.stringify({ type: 'spotify', data: currentSpotifyState }));
        ws.send(JSON.stringify({
          type: 'twitch',
          data: {
            viewerCount: stateConfig.viewer_count,
            isLive: stateConfig.is_live,
            latestFollower: stateConfig.latest_follower,
            latestSub: stateConfig.latest_sub,
            latestDonation: stateConfig.latest_donation
          }
        }));
        break;

      case 'trigger_action':
        handleAction(data.actionType, data.actionData, ws);
        break;

      case 'save_profiles':
        profilesConfig.profiles = data.profiles;
        if (data.activeProfile) {
          profilesConfig.activeProfile = data.activeProfile;
        }
        if (await saveJson(PROFILES_PATH, profilesConfig)) {
          broadcast({
            type: 'profiles_updated',
            profiles: profilesConfig.profiles,
            activeProfile: profilesConfig.activeProfile
          });
        } else {
          ws.send(JSON.stringify({ type: 'error', message: 'Failed to save profiles config' }));
        }
        break;

      case 'save_settings':
        settingsConfig = data.settings;
        if (await saveJson(SETTINGS_PATH, settingsConfig)) {
          broadcast({ type: 'settings_updated', settings: settingsConfig });
          // Reconnect OBS and Streamlabs
          connectToObs();
          connectStreamlabs();
        } else {
          ws.send(JSON.stringify({ type: 'error', message: 'Failed to save settings config' }));
        }
        break;

      case 'obs_connect':
        connectToObs();
        break;

      case 'obs_disconnect':
        try {
          await obs.disconnect();
        } catch (e) {
          console.error('Error disconnecting OBS:', e);
        }
        break;

      default:
        console.log('[WebSocket] Unhandled message:', data.type);
    }
  });

  ws.on('close', () => {
    console.log('[WebSocket] Client disconnected');
  });
});

// -------------------------------------------------------------
// EXPRESS HTTP API ROUTES
// -------------------------------------------------------------
app.get('/api/status', async (req, res) => {
  res.json({
    spotifyConnected: !!settingsConfig.spotify.refresh_token,
    streamlabsConnected: streamlabsWs && streamlabsWs.readyState === WebSocket.OPEN,
    latestFollower: stateConfig.latest_follower,
    latestSub: stateConfig.latest_sub,
    latestDonation: stateConfig.latest_donation,
    viewerCount: stateConfig.viewer_count,
    isLive: stateConfig.is_live,
    spotifySettingsSet: !!settingsConfig.spotify.client_id,
    streamlabsSettingsSet: !!settingsConfig.streamlabs.token,
    twitchUsername: settingsConfig.twitch ? settingsConfig.twitch.username : "SAMUCA2835",
    obsConnected
  });
});

app.post('/api/settings', async (req, res) => {
  const { spotify_client_id, spotify_client_secret, streamlabs_token, viewer_count, is_live, twitch_username } = req.body;
  
  let reloadSpotify = false;
  let reloadStreamlabs = false;

  if (spotify_client_id !== undefined && spotify_client_id !== settingsConfig.spotify.client_id) {
    settingsConfig.spotify.client_id = spotify_client_id;
    reloadSpotify = true;
  }
  if (spotify_client_secret !== undefined && spotify_client_secret !== settingsConfig.spotify.client_secret) {
    settingsConfig.spotify.client_secret = spotify_client_secret;
    reloadSpotify = true;
  }
  if (streamlabs_token !== undefined && streamlabs_token !== settingsConfig.streamlabs.token) {
    settingsConfig.streamlabs.token = streamlabs_token;
    reloadStreamlabs = true;
  }
  if (viewer_count !== undefined) {
    stateConfig.viewer_count = parseInt(viewer_count) || 0;
  }
  if (is_live !== undefined) {
    stateConfig.is_live = !!is_live;
  }
  if (twitch_username !== undefined) {
    if (!settingsConfig.twitch) settingsConfig.twitch = {};
    settingsConfig.twitch.username = twitch_username.trim();
  }

  await saveJson(SETTINGS_PATH, settingsConfig);
  await saveJson(STATE_PATH, stateConfig);

  // Sync twitch state immediately
  broadcast({
    type: 'twitch',
    data: {
      viewerCount: stateConfig.viewer_count,
      isLive: stateConfig.is_live,
      latestFollower: stateConfig.latest_follower,
      latestSub: stateConfig.latest_sub,
      latestDonation: stateConfig.latest_donation
    }
  });

  if (reloadSpotify) {
    settingsConfig.spotify.refresh_token = "";
    settingsConfig.spotify.access_token = "";
    await saveJson(SETTINGS_PATH, settingsConfig);
  }
  if (reloadStreamlabs) {
    connectStreamlabs();
  }

  res.json({ success: true, reloadSpotify });
});

async function spotifyApiCall(endpoint, method, body = null) {
  if (!settingsConfig.spotify.refresh_token || !settingsConfig.spotify.client_id || !settingsConfig.spotify.client_secret) {
    throw new Error('Spotify not configured');
  }

  let accessToken = settingsConfig.spotify.access_token;
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  let response = await fetch(`https://api.spotify.com/v1/${endpoint}`, options);

  if (response.status === 401) {
    console.log('[Spotify] API Call unauthorized, refreshing token...');
    accessToken = await refreshSpotifyToken();
    if (!accessToken) throw new Error('Failed to refresh Spotify token');
    
    options.headers['Authorization'] = `Bearer ${accessToken}`;
    response = await fetch(`https://api.spotify.com/v1/${endpoint}`, options);
  }

  return response;
}

// Spotify Playback Control API
app.post('/api/spotify/control', async (req, res) => {
  const { action, value } = req.body;
  try {
    let endpoint = '';
    let method = 'PUT';
    
    switch (action) {
      case 'play':
        endpoint = 'me/player/play';
        method = 'PUT';
        break;
      case 'pause':
        endpoint = 'me/player/pause';
        method = 'PUT';
        break;
      case 'next':
        endpoint = 'me/player/next';
        method = 'POST';
        break;
      case 'previous':
        endpoint = 'me/player/previous';
        method = 'POST';
        break;
      case 'volume':
        endpoint = `me/player/volume?volume_percent=${value}`;
        method = 'PUT';
        break;
      case 'seek':
        endpoint = `me/player/seek?position_ms=${value}`;
        method = 'PUT';
        break;
      default:
        return res.status(400).json({ error: 'Ação inválida' });
    }

    const response = await spotifyApiCall(endpoint, method);
    
    if (response.status === 204 || response.ok) {
      setTimeout(pollSpotify, 500);
      return res.json({ success: true });
    } else {
      const errText = await response.text();
      return res.status(response.status).json({ error: errText || 'Spotify API error' });
    }
  } catch (err) {
    console.error('[Spotify Control] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Soundboard API: List sounds
app.get('/api/soundboard/sounds', async (req, res) => {
  try {
    const files = await fs.readdir(UPLOADS_DIR);
    const audioFiles = [];
    for (const f of files) {
      const lower = f.toLowerCase();
      if (lower.endsWith('.mp3') || lower.endsWith('.wav') || lower.endsWith('.ogg') || lower.endsWith('.m4a')) {
        const stats = await fs.stat(path.join(UPLOADS_DIR, f));
        // Clean name (remove date stamp and replace underscores)
        const cleanName = f.replace(/_[0-9]+\.[a-z0-9]+$/i, '').replace(/_/g, ' ');
        audioFiles.push({
          id: f,
          name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
          file: `/uploads/${f}`,
          size: stats.size
        });
      }
    }
    res.json(audioFiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Soundboard API: Upload sound
app.post('/api/soundboard/upload', upload.single('sound'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }
  const cleanName = req.file.filename.replace(/_[0-9]+\.[a-z0-9]+$/i, '').replace(/_/g, ' ');
  res.json({
    success: true,
    file: {
      id: req.file.filename,
      name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
      file: `/uploads/${req.file.filename}`
    }
  });
});

// Button Image Upload
app.post('/api/button-image/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'Nenhuma imagem enviada' });
  }
  res.json({ success: true, url: `/uploads/${req.file.filename}` });
});

// Spotify Login Redirect
app.get('/login', async (req, res) => {
  if (!settingsConfig.spotify.client_id) {
    return res.status(400).send('Spotify Client ID não configurado!');
  }
  const port = settingsConfig.server.port || 3000;
  const scopes = 'user-read-currently-playing user-read-playback-state user-modify-playback-state';
  const redirectUri = `http://localhost:${port}/callback`;
  
  res.redirect('https://accounts.spotify.com/authorize?' + 
    new URLSearchParams({
      response_type: 'code',
      client_id: settingsConfig.spotify.client_id,
      scope: scopes,
      redirect_uri: redirectUri
    }).toString()
  );
});

// Spotify Auth Callback
app.get('/callback', async (req, res) => {
  const code = req.query.code || null;
  const port = settingsConfig.server.port || 3000;
  const redirectUri = `http://localhost:${port}/callback`;

  if (!code) {
    return res.status(400).send('Authorization code missing.');
  }

  try {
    const creds = Buffer.from(`${settingsConfig.spotify.client_id}:${settingsConfig.spotify.client_secret}`).toString('base64');
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${creds}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        code: code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Token exchange failed: ${response.status} - ${errBody}`);
    }

    const data = await response.json();
    settingsConfig.spotify.access_token = data.access_token;
    settingsConfig.spotify.refresh_token = data.refresh_token;
    await saveJson(SETTINGS_PATH, settingsConfig);

    console.log('[Spotify] Login successful and tokens saved.');

    res.send(`
      <html>
        <body style="background:#0a0814;color:#f0e6d0;font-family:sans-serif;text-align:center;padding-top:100px;">
          <h1 style="color:#E8A020;">Autenticado com Sucesso!</h1>
          <p>O Spotify foi conectado. Pode fechar esta janela agora.</p>
          <script>setTimeout(() => window.close(), 3000);</script>
        </body>
      </html>
    `);

    // Immediate poll
    pollSpotify();

  } catch (err) {
    console.error('[Spotify] Auth callback error:', err);
    res.status(500).send(`Erro de autenticação: ${err.message}`);
  }
});

// Trigger test alerts
app.post('/api/test-alert', async (req, res) => {
  const { type, name, message, amount, tier } = req.body;

  console.log(`[Test Alert] Triggered ${type} for name: ${name}`);

  if (type === 'follow') {
    stateConfig.latest_follower = name || 'PixelTest';
    await saveJson(STATE_PATH, stateConfig);
    broadcast({
      type: 'twitch',
      data: {
        viewerCount: stateConfig.viewer_count,
        isLive: stateConfig.is_live,
        latestFollower: stateConfig.latest_follower,
        latestSub: stateConfig.latest_sub,
        latestDonation: stateConfig.latest_donation
      }
    });
    broadcast({
      type: 'alert',
      data: {
        alertType: 'follow',
        name: name || 'PixelTest',
        message: message || 'BORA BORA!'
      }
    });
  } else if (type === 'sub') {
    stateConfig.latest_sub = name || 'SubTest';
    await saveJson(STATE_PATH, stateConfig);
    broadcast({
      type: 'twitch',
      data: {
        viewerCount: stateConfig.viewer_count,
        isLive: stateConfig.is_live,
        latestFollower: stateConfig.latest_follower,
        latestSub: stateConfig.latest_sub,
        latestDonation: stateConfig.latest_donation
      }
    });
    broadcast({
      type: 'alert',
      data: {
        alertType: 'sub',
        name: name || 'SubTest',
        message: message || 'MUITO GRATO, MANO!',
        tier: tier || 'TIER 1'
      }
    });
  } else if (type === 'donation') {
    broadcast({
      type: 'alert',
      data: {
        alertType: 'donation',
        name: name || 'DoadorTest',
        message: message || 'vai lá mano, kk!',
        amount: amount || 'R$ 10,00'
      }
    });
  }

  res.json({ success: true });
});

// Helper to find local IP
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// -------------------------------------------------------------
// BOOT
// -------------------------------------------------------------
const PORT = settingsConfig.server.port || 3000;
server.listen(PORT, async () => {
  const localIp = getLocalIpAddress();
  console.log('\n======================================================');
  console.log(`🚀 Unified Streamer Panel is running!`);
  console.log(`💻 Local access: http://localhost:${PORT}`);
  console.log(`📱 Mobile/Deck access: http://${localIp}:${PORT}`);
  console.log('======================================================\n');
  
  // Auto connect components
  if (settingsConfig.obs.autoConnect) {
    connectToObs();
  }
  connectStreamlabs();
  startSpotifyPoll();

  // Auto open dashboard on PC
  try {
    await open(`http://localhost:${PORT}`);
  } catch (err) {
    console.error('Failed to auto-open dashboard:', err);
  }
});
