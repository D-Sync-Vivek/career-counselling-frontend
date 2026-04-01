export function decodeJWT(token) {
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export function getCurrentUser() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  const payload = decodeJWT(token);
  if (!payload) return null;
  return {
    userId: payload.user_id,
    email: payload.sub,
    role: payload.role || 'student',
  };
}

function emailToFirstName(email) {
  return (
    email.split('@')[0].split('.')[0].replace(/\d+/g, '').replace(/^./, c => c.toUpperCase()) ||
    'there'
  );
}

export function getUserDisplayName() {
  const user = getCurrentUser();
  if (!user) return 'there';

  // Only students may use harmony_profile_name — and only if it belongs to
  // the currently-logged-in user (keyed by userId to prevent cross-user leak).
  if (user.role === 'student') {
    const storedId = localStorage.getItem('harmony_profile_owner');
    const storedName = localStorage.getItem('harmony_profile_name');
    if (storedName && storedId === user.userId) return storedName;
  }

  // Mentors/parents/admins: never touch harmony_profile_name.
  // Use a role-specific key if it exists, else format the email.
  if (user.role === 'mentor') {
    return localStorage.getItem('harmony_mentor_name') || emailToFirstName(user.email);
  }

  return emailToFirstName(user.email);
}

/**
 * Wipes all auth tokens AND every harmony_* key from localStorage.
 * Call this on logout and at the start of every new login.
 */
export function clearUserSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('userId');

  const harmonyKeys = Object.keys(localStorage).filter(k => k.startsWith('harmony_'));
  harmonyKeys.forEach(k => localStorage.removeItem(k));
}
