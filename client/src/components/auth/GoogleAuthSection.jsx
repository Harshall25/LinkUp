import { useEffect, useRef, useState } from 'react';
import { authAPI } from '../../api/auth';
import { useTheme } from '../../context/ThemeContext';

const GIS_SRC = 'https://accounts.google.com/gsi/client';

let clientIdPromise = null;
const getClientId = () =>
  (clientIdPromise ??= authAPI
    .getConfig()
    .then((config) => config.googleClientId || null)
    .catch(() => {
      clientIdPromise = null;
      return null;
    }));

let scriptPromise = null;
const loadGoogleScript = () =>
  (scriptPromise ??= new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const script = document.createElement('script');
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error('Could not load Google sign-in'));
    };
    document.head.appendChild(script);
  }));

// google.accounts.id.initialize must run once per page; the active page's
// handler is swapped in through this module-level reference.
let initializedClientId = null;
let credentialHandler = null;

export function GoogleAuthSection({ mode = 'signin', onCredential, dividerLabel = 'or' }) {
  const { theme } = useTheme();
  const buttonRef = useRef(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    credentialHandler = onCredential;
    return () => {
      if (credentialHandler === onCredential) credentialHandler = null;
    };
  }, [onCredential]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const clientId = await getClientId();
      if (!clientId) {
        if (!cancelled) setStatus('unconfigured');
        return;
      }
      try {
        await loadGoogleScript();
      } catch {
        if (!cancelled) setStatus('hidden');
        return;
      }
      const container = buttonRef.current;
      if (cancelled || !container) return;

      const gis = window.google.accounts.id;
      if (initializedClientId !== clientId) {
        gis.initialize({
          client_id: clientId,
          callback: (response) => credentialHandler?.(response.credential),
          ux_mode: 'popup',
          cancel_on_tap_outside: true,
        });
        initializedClientId = clientId;
      }

      container.innerHTML = '';
      gis.renderButton(container, {
        type: 'standard',
        theme: theme === 'dark' ? 'filled_black' : 'outline',
        size: 'large',
        shape: 'pill',
        text: mode === 'signup' ? 'signup_with' : 'continue_with',
        logo_alignment: 'center',
        width: Math.max(200, Math.min(400, container.offsetWidth || 360)),
      });
      setStatus('ready');
    })();
    return () => {
      cancelled = true;
    };
  }, [mode, theme]);

  if (status === 'unconfigured' && import.meta.env.DEV) {
    return (
      <p className="mb-6 rounded-2xl border border-dashed border-outline-variant px-4 py-3 text-xs text-on-surface-variant">
        Google sign-in is off: set <code className="font-semibold">GOOGLE_CLIENT_ID</code> in{' '}
        <code className="font-semibold">server/.env</code> and restart the API. (Only shown in development.)
      </p>
    );
  }

  if (status !== 'loading' && status !== 'ready') return null;

  return (
    <div className="mb-6">
      <div className="relative h-11">
        {status === 'loading' && (
          <div className="absolute inset-0 rounded-full bg-surface-container animate-pulse" aria-hidden="true" />
        )}
        <div ref={buttonRef} className="flex justify-center w-full h-11 [color-scheme:light]" />
      </div>
      <div className="mt-6 flex items-center gap-3" role="separator">
        <span className="h-px flex-1 bg-outline-variant/70" />
        <span className="text-xs font-medium text-on-surface-variant">{dividerLabel}</span>
        <span className="h-px flex-1 bg-outline-variant/70" />
      </div>
    </div>
  );
}
