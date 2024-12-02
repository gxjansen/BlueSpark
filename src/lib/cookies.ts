import Cookies from 'js-cookie';
import type { BlueSkyCredentials } from '../types/bluesky';

const CREDENTIALS_COOKIE = 'bluespark_credentials';

export function saveCredentials(credentials: BlueSkyCredentials) {
  Cookies.set(CREDENTIALS_COOKIE, JSON.stringify(credentials), {
    expires: 30, // 30 days
    secure: true,
    sameSite: 'strict'
  });
}

export function getCredentials(): BlueSkyCredentials | null {
  const cookie = Cookies.get(CREDENTIALS_COOKIE);
  if (!cookie) return null;

  try {
    return JSON.parse(cookie);
  } catch (error) {
    console.error('Failed to parse credentials cookie:', error);
    return null;
  }
}

export function clearCredentials() {
  Cookies.remove(CREDENTIALS_COOKIE);
}
