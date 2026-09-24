import axios from 'axios';
import {Platform} from 'react-native';
import * as Keychain from 'react-native-keychain';

/**
 * API_URL:
 *   __DEV__ (running from Metro):
 *     Android emulator → 10.0.2.2 maps to host machine localhost
 *     Physical device  → your machine's LAN IP (update DEV_LAN_IP if your Wi-Fi IP changes)
 *   Otherwise → deployed Render backend. This includes the standalone
 *   debug APK, whose bundled JS is built with dev=false.
 */
const PRODUCTION_URL = 'https://sekirite-lavenir-backend.onrender.com';
const DEV_LAN_IP = '192.168.100.20';

const {Fingerprint = '', Model = ''} = Platform.constants ?? {};
const isEmulator = /generic|emulator|sdk_gphone/i.test(`${Fingerprint} ${Model}`);

export const API_URL = __DEV__
  ? `http://${isEmulator ? '10.0.2.2' : DEV_LAN_IP}:5000`
  : PRODUCTION_URL;

// ── Token helpers (Android Keystore via react-native-keychain) ────────────────
const KEYCHAIN_SERVICE = 'SekiriteLavenirTokens';

export const saveTokens = async (accessToken, refreshToken) => {
  await Keychain.setGenericPassword(
    accessToken,
    refreshToken,
    {service: KEYCHAIN_SERVICE, accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK},
  );
};

export const getTokens = async () => {
  const creds = await Keychain.getGenericPassword({service: KEYCHAIN_SERVICE});
  if (!creds) return null;
  return {accessToken: creds.username, refreshToken: creds.password};
};

export const clearTokens = async () => {
  await Keychain.resetGenericPassword({service: KEYCHAIN_SERVICE});
};

// ── Axios instance ────────────────────────────────────────────────────────────
const client = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  headers: {'Content-Type': 'application/json'},
});

// Attach access token to every request
client.interceptors.request.use(async config => {
  const tokens = await getTokens();
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

// Auto-refresh on 401
let refreshing = false;
let waitQueue = [];

const drainQueue = token => {
  waitQueue.forEach(({resolve, reject}) => (token ? resolve(token) : reject()));
  waitQueue = [];
};

client.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      if (refreshing) {
        return new Promise((resolve, reject) =>
          waitQueue.push({resolve, reject}),
        ).then(token => {
          original.headers.Authorization = `Bearer ${token}`;
          return client(original);
        });
      }
      original._retry = true;
      refreshing = true;
      try {
        const tokens = await getTokens();
        if (!tokens?.refreshToken) throw new Error('no refresh token');
        const {data} = await axios.post(`${API_URL}/api/auth/refresh-mobile`, {
          refreshToken: tokens.refreshToken,
        });
        await saveTokens(data.accessToken, data.refreshToken);
        drainQueue(data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return client(original);
      } catch {
        drainQueue(null);
        await clearTokens();
        return Promise.reject(err);
      } finally {
        refreshing = false;
      }
    }
    return Promise.reject(err);
  },
);

export default client;
