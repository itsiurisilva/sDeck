import 'dotenv/config';
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
import { io } from 'socket.io-client';
import rateLimit from 'express-rate-limit';
import { generatePin, isValidPin, isLocalRequest, isValidProfilesPayload } from './lib/validators.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const CONFIG_DIR = path.join(__dirname, 'config');
const SETTINGS_PATH = path.join(CONFIG_DIR, 'settings.json');
const PROFILES_PATH = path.join(CONFIG_DIR, 'profiles.json');
const STATE_PATH = path.join(CONFIG_DIR, 'state.json');
const SOUNDS_META_PATH = path.join(CONFIG_DIR, 'sounds-meta.json');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

const DEFAULT_SYNTHS = [
  { id: 'airhorn', name: 'Airhorn', icon: 'wind', isSynth: true },
  { id: 'siren', name: 'Siren', icon: 'megaphone', isSynth: true },
  { id: 'coin', name: 'Coin', icon: 'coins', isSynth: true },
  { id: 'laser', name: 'Laser', icon: 'zap', isSynth: true },
  { id: 'boom', name: 'Boom', icon: 'bomb', isSynth: true },
  { id: 'success', name: 'Success', icon: 'check-circle', isSynth: true },
  { id: 'drumroll', name: 'Drum Roll', icon: 'music-4', isSynth: true },
  { id: 'rimshot', name: 'Ba Dum Tss', icon: 'drum', isSynth: true },
  { id: 'notification', name: 'Notification', icon: 'bell', isSynth: true },
  { id: 'level_up', name: 'Level Up', icon: 'trending-up', isSynth: true },
  { id: 'sad_trombone', name: 'Sad Trombone', icon: 'frown', isSynth: true },
  { id: 'fanfare', name: 'Fanfare', icon: 'trophy', isSynth: true },
  { id: 'error', name: 'Error', icon: 'x-circle', isSynth: true },
  { id: 'chime', name: 'Chime', icon: 'sparkles', isSynth: true },
  { id: 'heartbeat', name: 'Heartbeat', icon: 'heart', isSynth: true },
  { id: 'powerup', name: 'Power Up', icon: 'zap', isSynth: true },
  { id: 'sub_alert', name: 'Sub Alert', icon: 'star', isSynth: true },
  { id: 'glitch', name: 'Glitch', icon: 'shuffle', isSynth: true }
];

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
    const examplePath = filePath + '.example';
    try {
      const exampleData = await fs.readFile(examplePath, 'utf8');
      console.log(`[Config] Copying template from ${path.basename(examplePath)} to ${path.basename(filePath)}`);
      await fs.writeFile(filePath, exampleData, 'utf8');
      return JSON.parse(exampleData);
    } catch (tplErr) {
      console.log(`[Config] Creating default for ${path.basename(filePath)}`);
      await saveJson(filePath, defaults);
      return defaults;
    }
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
  firstSetupCompleted: false,
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
    username: "",
    chatToken: ""
  },
  security: {
    pin: ""
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

// Pairing PIN: required for any non-localhost device to use the WebSocket/API.
// The host machine itself (loopback requests) never needs it.
if (!settingsConfig.security) settingsConfig.security = {};
if (!settingsConfig.security.pin) {
  settingsConfig.security.pin = generatePin();
  await saveJson(SETTINGS_PATH, settingsConfig);
}

// Settings payload sent to connected clients should never include the pairing
// PIN itself — it's only readable via the local-only /api/security/pin route.
function clientSafeSettings() {
  const copy = { ...settingsConfig };
  delete copy.security;
  return copy;
}

function getTwitchData() {
  return {
    viewerCount: stateConfig.viewer_count,
    isLive: stateConfig.is_live,
    latestFollower: stateConfig.latest_follower,
    latestSub: stateConfig.latest_sub,
    latestDonation: stateConfig.latest_donation,
    twitchUsername: settingsConfig.twitch?.username || process.env.TWITCH_USERNAME || "Streamer",
    twitterHandle: process.env.TWITTER_HANDLE || "",
    instagramHandle: process.env.INSTAGRAM_HANDLE || "",
    tiktokHandle: process.env.TIKTOK_HANDLE || "",
    youtubeHandle: process.env.YOUTUBE_HANDLE || ""
  };
}

// Express and Server setup
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Non-local devices (phones/tablets on the LAN) must present the pairing PIN
// on every API call. Requests from the host machine itself are always trusted.
app.use('/api', (req, res, next) => {
  if (isLocalRequest(req)) return next();
  const pin = req.header('x-sdeck-pin') || req.query.pin;
  if (!isValidPin(pin, settingsConfig.security.pin)) {
    return res.status(401).json({ error: 'Missing or invalid pairing PIN.' });
  }
  next();
});

// Throttles the soundboard management endpoints (list/delete), which touch the filesystem.
const soundboardLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false
});

// Global state
let currentSpotifyState = {
  title: 'No track playing',
  artist: 'Spotify',
  progressStr: '0:00',
  durationStr: '0:00',
  progressPercent: 0,
  albumArt: '',
  isPlaying: false
};

let streamlabsSocket = null;
let spotifyInterval = null;
let twitchIrcWs = null;
let twitchChatConnected = false;

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
function mimeFileFilter(allowedPrefix) {
  return (req, file, cb) => {
    if (file.mimetype.startsWith(allowedPrefix)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: expected ${allowedPrefix}*, got ${file.mimetype}`));
    }
  };
}

const uploadAudio = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: mimeFileFilter('audio/')
});

const uploadImage = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: mimeFileFilter('image/')
});

// Wraps a multer middleware so file-type/size rejections come back as JSON
// instead of falling through to Express's default HTML error page.
function handleUpload(multerMiddleware) {
  return (req, res, next) => {
    multerMiddleware(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, error: err.message || 'Upload failed' });
      }
      next();
    });
  };
}

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
// TWITCH IRC (CHAT)
// -------------------------------------------------------------
function connectTwitchIrc() {
  const token = settingsConfig.twitch?.chatToken;
  const username = settingsConfig.twitch?.username;
  if (!token || !username) return;

  if (twitchIrcWs) {
    try { twitchIrcWs.terminate(); } catch(e) {}
    twitchIrcWs = null;
  }

  const ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443');
  twitchIrcWs = ws;

  ws.on('open', () => {
    ws.send(`PASS oauth:${token.replace(/^oauth:/i, '')}`);
    ws.send(`NICK ${username.toLowerCase()}`);
    ws.send(`JOIN #${username.toLowerCase()}`);
    twitchChatConnected = true;
    broadcast({ type: 'twitch_irc_status', connected: true });
    console.log('[TwitchIRC] Connected to', username);
  });

  ws.on('message', (data) => {
    const msg = data.toString();
    if (msg.startsWith('PING')) ws.send('PONG :tmi.twitch.tv');
    if (msg.includes('NOTICE') && msg.includes('Login authentication failed')) {
      console.error('[TwitchIRC] Auth failed — check OAuth token');
      twitchChatConnected = false;
      broadcast({ type: 'twitch_irc_status', connected: false, error: 'Invalid token' });
    }
  });

  ws.on('close', () => {
    twitchChatConnected = false;
    twitchIrcWs = null;
    broadcast({ type: 'twitch_irc_status', connected: false });
    setTimeout(connectTwitchIrc, 15000);
  });

  ws.on('error', (err) => {
    console.error('[TwitchIRC] Error:', err.message);
    try { ws.close(); } catch(e) {}
  });
}

function sendTwitchChatMessage(message) {
  const username = settingsConfig.twitch?.username;
  if (!twitchChatConnected || !twitchIrcWs || !username) return false;
  twitchIrcWs.send(`PRIVMSG #${username.toLowerCase()} :${message}`);
  return true;
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

  if (streamlabsSocket) {
    streamlabsSocket.disconnect();
  }

  console.log('[Streamlabs] Connecting to Streamlabs Socket.IO...');
  
  streamlabsSocket = io(`https://sockets.streamlabs.com?token=${token}`, {
    transports: ['websocket'],
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: Infinity
  });

  streamlabsSocket.on('connect', () => {
    console.log('[Streamlabs] Connected successfully to Streamlabs!');
    broadcast({ type: 'streamlabs_status', connected: true });
  });

  streamlabsSocket.on('disconnect', (reason) => {
    console.warn(`[Streamlabs] Connection closed: ${reason}. Reconnecting...`);
    broadcast({ type: 'streamlabs_status', connected: false });
  });

  streamlabsSocket.on('connect_error', (error) => {
    console.error('[Streamlabs] Connection error:', error.message);
    broadcast({ type: 'streamlabs_status', connected: false, error: error.message });
  });

  streamlabsSocket.on('event', async (eventData) => {
    try {
      await handleStreamlabsEvent(eventData);
    } catch (err) {
      console.error('[Streamlabs] Error handling event:', err);
    }
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
      data: getTwitchData()
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
      data: getTwitchData()
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
      data: getTwitchData()
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
        let { sceneName, sourceName } = actionData.params;
        let targetScene = sceneName?.trim();
        let item = null;

        if (!targetScene) {
          // 1. Try current active scene first
          if (obsCurrentScene) {
            try {
              const response = await obs.call('GetSceneItemList', { sceneName: obsCurrentScene });
              item = response.sceneItems.find(i => i.sourceName === sourceName);
              if (item) {
                targetScene = obsCurrentScene;
              }
            } catch (err) {
              console.warn(`Failed to search in current scene: ${err.message}`);
            }
          }

          // 2. If not found in current scene, search all scenes
          if (!item && obsScenes && obsScenes.length > 0) {
            for (const scene of obsScenes) {
              try {
                const response = await obs.call('GetSceneItemList', { sceneName: scene });
                const foundItem = response.sceneItems.find(i => i.sourceName === sourceName);
                if (foundItem) {
                  item = foundItem;
                  targetScene = scene;
                  break;
                }
              } catch (err) {
                // ignore and check next scene
              }
            }
          }
        } else {
          // User specified a scene
          const response = await obs.call('GetSceneItemList', { sceneName: targetScene });
          item = response.sceneItems.find(i => i.sourceName === sourceName);
        }

        if (!targetScene || !item) {
          throw new Error(`Source '${sourceName}' not found in ${sceneName ? `scene '${sceneName}'` : 'any scene'}`);
        }

        await obs.call('SetSceneItemEnabled', {
          sceneName: targetScene,
          sceneItemId: item.sceneItemId,
          sceneItemEnabled: !item.sceneItemEnabled
        });
      } else {
        const cmd = actionData.command === 'Custom' ? actionData.customRequest : actionData.command;
        await obs.call(cmd, actionData.params || {});
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
    exec(command, { timeout: 15000, killSignal: 'SIGTERM' }, (error, stdout, stderr) => {
      if (error) {
        const reason = error.killed ? 'Command timed out after 15s and was terminated' : error.message;
        console.error(`System command execution error:`, error);
        ws.send(JSON.stringify({
          type: 'error',
          message: `Failed to launch: ${reason}`
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
  } else if (type === 'url') {
    const url = actionData.url;
    if (!url || url.trim() === '') {
      ws.send(JSON.stringify({ type: 'error', message: 'No URL specified' }));
      return;
    }
    try {
      await open(url);
    } catch (err) {
      console.error('URL open error:', err);
      ws.send(JSON.stringify({ type: 'error', message: `Failed to open URL: ${err.message}` }));
    }
  } else if (type === 'webhook') {
    const url = actionData.url;
    if (!url || url.trim() === '') {
      ws.send(JSON.stringify({ type: 'error', message: 'No webhook URL specified' }));
      return;
    }
    try {
      const method = (actionData.method || 'GET').toUpperCase();
      const options = { method };
      if (method !== 'GET' && actionData.body) {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = actionData.body;
      }
      const response = await fetch(url, options);
      if (!response.ok) {
        console.warn(`Webhook responded with status ${response.status}`);
      }
    } catch (err) {
      console.error('Webhook error:', err);
      ws.send(JSON.stringify({ type: 'error', message: `Webhook failed: ${err.message}` }));
    }
  } else {
    console.log(`Action type ${type} handled client-side.`);
  }
}

// -------------------------------------------------------------
// WEBSOCKET CLIENTS ROUTING
// -------------------------------------------------------------
wss.on('connection', async (ws, req) => {
  if (!isLocalRequest(req)) {
    const pin = new URL(req.url, 'http://localhost').searchParams.get('pin');
    if (!isValidPin(pin, settingsConfig.security.pin)) {
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid or missing pairing PIN.' }));
      ws.close(4001, 'Invalid PIN');
      return;
    }
  }
  console.log('[WebSocket] Client connected');

  // 1. Send Deck Configuration and OBS data
  ws.send(JSON.stringify({
    type: 'init_data',
    profiles: profilesConfig.profiles,
    activeProfile: profilesConfig.activeProfile,
    settings: clientSafeSettings(),
    obsConnected,
    obsCurrentScene,
    obsMuteStates,
    obsStreamState,
    obsRecordState,
    obsScenes,
    obsInputs,
    obsActiveSceneItems,
    twitchChatConnected,
    streamlabsConnected: !!streamlabsSocket?.connected,
    spotifyUser: spotifyUserProfile
  }));

  // 2. Send Spotify current playback state (for overlays/dashboard)
  ws.send(JSON.stringify({ type: 'spotify', data: currentSpotifyState }));

  // 3. Send live stats state (for overlays/dashboard)
  ws.send(JSON.stringify({
    type: 'twitch',
    data: getTwitchData()
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
          settings: clientSafeSettings(),
          obsConnected,
          obsCurrentScene,
          obsMuteStates,
          obsStreamState,
          obsRecordState,
          obsScenes,
          obsInputs,
          obsActiveSceneItems,
          twitchChatConnected,
          streamlabsConnected: !!streamlabsSocket?.connected,
          spotifyUser: spotifyUserProfile
        }));
        ws.send(JSON.stringify({ type: 'spotify', data: currentSpotifyState }));
        ws.send(JSON.stringify({
          type: 'twitch',
          data: getTwitchData()
        }));
        break;

      case 'trigger_action':
        handleAction(data.actionType, data.actionData, ws);
        break;

      case 'save_profiles':
        if (!isValidProfilesPayload(data.profiles)) {
          ws.send(JSON.stringify({ type: 'error', message: 'Rejected: malformed profiles payload.' }));
          return;
        }
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
          broadcast({ type: 'settings_updated', settings: clientSafeSettings(), spotifyUser: spotifyUserProfile });
          connectToObs();
          connectStreamlabs();
          connectTwitchIrc();
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

      case 'send_chat_message': {
        const sent = sendTwitchChatMessage(data.message);
        if (!sent) {
          ws.send(JSON.stringify({ type: 'error', message: 'Twitch Chat not connected! Configure the OAuth Token in Config > Stream & Alerts.' }));
        }
        break;
      }

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
    spotifyUser: spotifyUserProfile,
    streamlabsConnected: !!streamlabsSocket?.connected,
    latestFollower: stateConfig.latest_follower,
    latestSub: stateConfig.latest_sub,
    latestDonation: stateConfig.latest_donation,
    viewerCount: stateConfig.viewer_count,
    isLive: stateConfig.is_live,
    spotifySettingsSet: !!settingsConfig.spotify.client_id,
    streamlabsSettingsSet: !!settingsConfig.streamlabs.token,
    twitchUsername: settingsConfig.twitch ? settingsConfig.twitch.username : "SAMUCA2835",
    twitchConnected: twitchChatConnected,
    obsConnected
  });
});

// Pairing PIN management — only ever reachable from the host machine itself
// (the /api gate above already blocks non-local requests without a valid PIN,
// which is exactly the point: you must already be at the host to read or
// reset the secret you hand out to a new device).
app.get('/api/security/pin', (req, res) => {
  res.json({ pin: settingsConfig.security.pin });
});

app.post('/api/security/pin/regenerate', async (req, res) => {
  settingsConfig.security.pin = generatePin();
  const ok = await saveJson(SETTINGS_PATH, settingsConfig);
  if (!ok) return res.status(500).json({ error: 'Failed to save new PIN' });
  res.json({ pin: settingsConfig.security.pin });
});

// New endpoints for disconnection and connection tests
app.post('/api/spotify/disconnect', async (req, res) => {
  try {
    settingsConfig.spotify.client_id = "";
    settingsConfig.spotify.client_secret = "";
    settingsConfig.spotify.access_token = "";
    settingsConfig.spotify.refresh_token = "";
    await saveJson(SETTINGS_PATH, settingsConfig);
    spotifyUserProfile = null;
    currentSpotifyState = {
      title: 'No track playing',
      artist: 'Spotify',
      progressStr: '0:00',
      durationStr: '0:00',
      progressPercent: 0,
      albumArt: '',
      isPlaying: false
    };
    broadcast({ type: 'spotify', data: currentSpotifyState });
    broadcast({ type: 'settings_updated', settings: clientSafeSettings(), spotifyUser: spotifyUserProfile });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/twitch/disconnect', async (req, res) => {
  try {
    if (!settingsConfig.twitch) settingsConfig.twitch = {};
    settingsConfig.twitch.username = "";
    settingsConfig.twitch.chatToken = "";
    await saveJson(SETTINGS_PATH, settingsConfig);
    
    if (twitchIrcWs) {
      try { twitchIrcWs.terminate(); } catch (e) {}
      twitchIrcWs = null;
    }
    twitchChatConnected = false;
    broadcast({ type: 'twitch_irc_status', connected: false });
    broadcast({ type: 'settings_updated', settings: clientSafeSettings(), spotifyUser: spotifyUserProfile });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/streamlabs/test', async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Token is required.' });
  }
  
  console.log('[Streamlabs] Testing token...');
  
  let resolved = false;
  let tempSocket = null;
  
  const timeout = setTimeout(() => {
    if (!resolved) {
      resolved = true;
      try { tempSocket.disconnect(); } catch (err) {}
      res.json({ success: false, error: 'Request timeout. Verify if the token is valid.' });
    }
  }, 6000);
  
  try {
    tempSocket = io(`https://sockets.streamlabs.com?token=${token}`, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: false
    });

    tempSocket.on('connect', () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        try { tempSocket.disconnect(); } catch (err) {}
        res.json({ success: true });
      }
    });

    tempSocket.on('connect_error', (err) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        try { tempSocket.disconnect(); } catch (e) {}
        res.json({ success: false, error: err.message || 'Failed to connect to Streamlabs server.' });
      }
    });
  } catch (e) {
    if (!resolved) {
      resolved = true;
      clearTimeout(timeout);
      res.json({ success: false, error: e.message });
    }
  }
});

app.post('/api/settings', async (req, res) => {
  const { 
    spotify_client_id, 
    spotify_client_secret, 
    streamlabs_token, 
    viewer_count, 
    is_live, 
    twitch_username,
    twitch_token,
    obs_host,
    obs_port,
    obs_password,
    firstSetupCompleted
  } = req.body;
  
  let reloadSpotify = false;
  let reloadStreamlabs = false;
  let reloadTwitch = false;
  let reloadObs = false;

  if (firstSetupCompleted !== undefined) {
    settingsConfig.firstSetupCompleted = !!firstSetupCompleted;
  }

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
    reloadTwitch = true;
  }
  if (twitch_token !== undefined) {
    if (!settingsConfig.twitch) settingsConfig.twitch = {};
    settingsConfig.twitch.chatToken = twitch_token.trim();
    reloadTwitch = true;
  }
  if (obs_host !== undefined) {
    settingsConfig.obs.host = obs_host.trim();
    reloadObs = true;
  }
  if (obs_port !== undefined) {
    settingsConfig.obs.port = obs_port.trim();
    reloadObs = true;
  }
  if (obs_password !== undefined) {
    settingsConfig.obs.password = obs_password;
    reloadObs = true;
  }

  await saveJson(SETTINGS_PATH, settingsConfig);
  await saveJson(STATE_PATH, stateConfig);

  // Sync twitch state immediately
  broadcast({
    type: 'twitch',
    data: getTwitchData()
  });

  // Broadcast settings update to all active frontend clients
  broadcast({ type: 'settings_updated', settings: clientSafeSettings(), spotifyUser: spotifyUserProfile });

  if (reloadSpotify) {
    settingsConfig.spotify.refresh_token = "";
    settingsConfig.spotify.access_token = "";
    await saveJson(SETTINGS_PATH, settingsConfig);
  }
  if (reloadStreamlabs) {
    connectStreamlabs();
  }
  if (reloadTwitch) {
    connectTwitchIrc();
  }
  if (reloadObs) {
    connectToObs();
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

let spotifyUserProfile = null;
async function fetchSpotifyProfile() {
  if (!settingsConfig.spotify.refresh_token || !settingsConfig.spotify.client_id || !settingsConfig.spotify.client_secret) {
    spotifyUserProfile = null;
    return null;
  }
  try {
    const response = await spotifyApiCall('me', 'GET');
    if (response.ok) {
      spotifyUserProfile = await response.json();
      console.log(`[Spotify] Connected to account: ${spotifyUserProfile.display_name}`);
      return spotifyUserProfile;
    } else {
      console.error('[Spotify] Failed to fetch profile, status:', response.status);
      spotifyUserProfile = null;
      return null;
    }
  } catch (err) {
    console.error('[Spotify] Profile fetch error:', err.message);
    spotifyUserProfile = null;
    return null;
  }
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
        return res.status(400).json({ error: 'Invalid action' });
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
app.get('/api/soundboard/sounds', soundboardLimiter, async (req, res) => {
  try {
    const meta = await loadJson(SOUNDS_META_PATH, {});
    const audioFiles = [];
    
    // 1. Add non-hidden synths
    DEFAULT_SYNTHS.forEach(s => {
      const soundMeta = meta[s.id] || {};
      if (soundMeta.hidden) return;
      audioFiles.push({
        id: s.id,
        name: soundMeta.displayName || s.name,
        icon: s.icon,
        isSynth: true,
        volume: soundMeta.volume ?? 100
      });
    });

    // 2. Add uploaded custom sounds
    let files = [];
    try {
      files = await fs.readdir(UPLOADS_DIR);
    } catch (err) {}

    for (const f of files) {
      const lower = f.toLowerCase();
      if (lower.endsWith('.mp3') || lower.endsWith('.wav') || lower.endsWith('.ogg') || lower.endsWith('.m4a')) {
        const stats = await fs.stat(path.join(UPLOADS_DIR, f));
        const cleanName = f.replace(/_[0-9]+\.[a-z0-9]+$/i, '').replace(/_/g, ' ');
        const defaultName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
        audioFiles.push({
          id: f,
          name: meta[f]?.displayName || defaultName,
          file: `/uploads/${f}`,
          size: stats.size,
          isSynth: false,
          volume: meta[f]?.volume ?? 100
        });
      }
    }
    res.json(audioFiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Soundboard API: Upload sound
app.post('/api/soundboard/upload', handleUpload(uploadAudio.single('sound')), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
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

// Soundboard API: Delete sound
app.delete('/api/soundboard/sounds/:id', soundboardLimiter, async (req, res) => {
  try {
    // Sanitize: strip any directory components so the id can never escape UPLOADS_DIR.
    const id = path.basename(req.params.id);
    const filePath = path.join(UPLOADS_DIR, id);
    
    try {
      await fs.unlink(filePath);
    } catch (e) {
      if (e.code !== 'ENOENT') throw e;
    }

    const meta = await loadJson(SOUNDS_META_PATH, {});
    const synthIds = DEFAULT_SYNTHS.map(s => s.id);
    if (synthIds.includes(id)) {
      meta[id] = { ...(meta[id] || {}), hidden: true };
    } else {
      delete meta[id];
    }
    await saveJson(SOUNDS_META_PATH, meta);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Soundboard API: Rename sound
app.patch('/api/soundboard/sounds/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { displayName, volume } = req.body;
    if (displayName === undefined && volume === undefined) {
      return res.status(400).json({ error: 'displayName or volume required' });
    }
    const meta = await loadJson(SOUNDS_META_PATH, {});
    const update = { ...(meta[id] || {}) };
    if (displayName !== undefined) update.displayName = displayName;
    if (volume !== undefined) {
      const v = Number(volume);
      if (!Number.isFinite(v) || v < 0 || v > 100) {
        return res.status(400).json({ error: 'volume must be a number between 0 and 100' });
      }
      update.volume = v;
    }
    meta[id] = update;
    await saveJson(SOUNDS_META_PATH, meta);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Button Image Upload
app.post('/api/button-image/upload', handleUpload(uploadImage.single('image')), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No image uploaded' });
  }
  res.json({ success: true, url: `/uploads/${req.file.filename}` });
});

// Spotify Login Redirect
app.get('/login', async (req, res) => {
  if (!settingsConfig.spotify.client_id) {
    return res.status(400).send('Spotify Client ID not configured!');
  }
  const scopes = 'user-read-currently-playing user-read-playback-state user-modify-playback-state';
  const redirectUri = `${req.protocol}://${req.headers.host}/callback`.replace('localhost', '127.0.0.1');
  
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
  const redirectUri = `${req.protocol}://${req.headers.host}/callback`.replace('localhost', '127.0.0.1');

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

    // Fetch user profile immediately
    await fetchSpotifyProfile();
    
    // Broadcast update to all connected clients
    broadcast({ type: 'settings_updated', settings: clientSafeSettings(), spotifyUser: spotifyUserProfile });

    res.send(`
      <html>
        <body style="background:#0a0814;color:#f0e6d0;font-family:sans-serif;text-align:center;padding-top:100px;">
          <h1 style="color:#E8A020;">Successfully Authenticated!</h1>
          <p>Spotify has been connected. You can close this window now.</p>
          <script>setTimeout(() => window.close(), 3000);</script>
        </body>
      </html>
    `);

    // Immediate poll
    pollSpotify();

  } catch (err) {
    console.error('[Spotify] Auth callback error:', err);
    res.status(500).send(`Authentication error: ${err.message}`);
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
      data: getTwitchData()
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
      data: getTwitchData()
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
// PROCESS-LEVEL SAFETY NETS
// -------------------------------------------------------------
process.on('unhandledRejection', (reason) => {
  console.error('[UnhandledRejection]', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[UncaughtException]', err);
});

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
  console.log(`🔑 Pairing PIN (needed by other devices on your Wi-Fi): ${settingsConfig.security.pin}`);
  console.log('======================================================\n');
  
  // Auto connect components
  if (settingsConfig.obs.autoConnect) {
    connectToObs();
  }
  connectStreamlabs();
  await fetchSpotifyProfile();
  startSpotifyPoll();
  connectTwitchIrc();

  // Auto open dashboard on PC
  try {
    await open(`http://localhost:${PORT}`);
  } catch (err) {
    console.error('Failed to auto-open dashboard:', err);
  }
});
