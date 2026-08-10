export interface PasswordResetAction {
  mode: 'resetPassword';
  oobCode: string;
}

/** Read Firebase email action params from the current web URL. */
export function getPasswordResetActionFromUrl(): PasswordResetAction | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const params = new URLSearchParams(window.location.search);
  const mode = params.get('mode');
  const oobCode = params.get('oobCode');

  if (mode === 'resetPassword' && oobCode) {
    return { mode: 'resetPassword', oobCode };
  }

  return null;
}

/** Remove Firebase action query params after handling the link. */
export function clearAuthActionParamsFromUrl(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const url = new URL(window.location.href);
  ['mode', 'oobCode', 'apiKey', 'lang', 'continueUrl'].forEach((key) => {
    url.searchParams.delete(key);
  });

  const next = url.search ? `${url.pathname}${url.search}` : url.pathname;
  window.history.replaceState({}, '', next);
}
