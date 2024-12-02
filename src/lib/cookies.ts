const COOKIE_NAME = 'bluespark_credentials';

export const cookies = {
  set: (credentials: { identifier: string; password: string }) => {
    // Encode credentials to base64 for basic security
    const encoded = btoa(JSON.stringify(credentials));
    // Set cookie to expire in 30 days
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${COOKIE_NAME}=${encoded}; expires=${expires}; path=/; SameSite=Strict`;
  },

  get: (): { identifier: string; password: string } | null => {
    const cookies = document.cookie.split(';');
    const credentialsCookie = cookies.find(cookie => 
      cookie.trim().startsWith(`${COOKIE_NAME}=`)
    );

    if (!credentialsCookie) return null;

    try {
      const encoded = credentialsCookie.split('=')[1].trim();
      return JSON.parse(atob(encoded));
    } catch (error) {
      console.error('Error parsing credentials cookie:', error);
      return null;
    }
  },

  remove: () => {
    document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
};
