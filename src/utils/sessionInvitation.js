import AsyncStorage from '@react-native-async-storage/async-storage';

export const PENDING_SESSION_INVITE_KEY = '@notarizr/pending-session-invite';

const QUERY_KEYS = {
  sessionId: ['sessionId', 'session_id', 'sid', 'id'],
  inviteToken: ['inviteToken', 'invite_token', 'token'],
  recordType: ['recordType', 'record_type', 'type'],
  role: ['role'],
};

const getFirstValue = (source, keys) => {
  for (const key of keys) {
    const value = source?.[key];
    if (Array.isArray(value) && value[0]) {
      return value[0];
    }
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
};

const readParamsFromUrl = url => {
  const rawUrl = String(url || '').trim();
  if (!rawUrl) {
    return {};
  }

  try {
    const parsed = new URL(rawUrl);
    const queryParams = {};
    parsed.searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    const pathParts = parsed.pathname.split('/').filter(Boolean);
    const hostParts =
      parsed.protocol === 'notarizr:'
        ? String(parsed.host || '')
            .split('/')
            .filter(Boolean)
        : [];
    const parts = [...hostParts, ...pathParts];
    const inviteIndex = parts.findIndex(part =>
      ['session', 'invite', 'invitation'].includes(part.toLowerCase()),
    );
    const typePart =
      inviteIndex >= 0 && parts[inviteIndex + 1]
        ? parts[inviteIndex + 1].toLowerCase()
        : '';
    const typeOffset = ['booking', 'session'].includes(typePart) ? 2 : 1;
    const pathSessionId =
      inviteIndex >= 0 && parts[inviteIndex + typeOffset]
        ? parts[inviteIndex + typeOffset]
        : '';

    return {
      ...queryParams,
      recordType: queryParams.recordType || queryParams.type || typePart || '',
      sessionId:
        queryParams.sessionId || queryParams.session_id || pathSessionId,
    };
  } catch (_) {
    return {};
  }
};

export const normalizeSessionInviteParams = source => {
  const sourceParams =
    typeof source === 'string' ? readParamsFromUrl(source) : source || {};
  const sessionId = getFirstValue(sourceParams, QUERY_KEYS.sessionId);
  const inviteToken = getFirstValue(sourceParams, QUERY_KEYS.inviteToken);
  const recordType = getFirstValue(sourceParams, QUERY_KEYS.recordType);

  if (!sessionId && !inviteToken) {
    return null;
  }

  return {
    sessionId,
    inviteToken,
    recordType: ['booking', 'session'].includes(recordType)
      ? recordType
      : 'session',
    role: getFirstValue(sourceParams, QUERY_KEYS.role),
    sourceUrl:
      typeof sourceParams.sourceUrl === 'string'
        ? sourceParams.sourceUrl
        : typeof source === 'string'
        ? source
        : '',
    openedAt: sourceParams.openedAt || new Date().toISOString(),
  };
};

export const savePendingSessionInvite = async invite => {
  const normalized = normalizeSessionInviteParams(invite);
  if (!normalized) {
    return null;
  }
  await AsyncStorage.setItem(
    PENDING_SESSION_INVITE_KEY,
    JSON.stringify(normalized),
  );
  return normalized;
};

export const getPendingSessionInvite = async () => {
  const rawInvite = await AsyncStorage.getItem(PENDING_SESSION_INVITE_KEY);
  if (!rawInvite) {
    return null;
  }

  try {
    return normalizeSessionInviteParams(JSON.parse(rawInvite));
  } catch (_) {
    await AsyncStorage.removeItem(PENDING_SESSION_INVITE_KEY);
    return null;
  }
};

export const clearPendingSessionInvite = () =>
  AsyncStorage.removeItem(PENDING_SESSION_INVITE_KEY);
