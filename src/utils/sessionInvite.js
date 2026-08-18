const SESSION_INVITE_MEDIA_PREFIX = 'notarizr-session://';

export const buildSessionInviteMedia = session =>
  `${SESSION_INVITE_MEDIA_PREFIX}${encodeURIComponent(
    JSON.stringify(session),
  )}`;

export const parseSessionInviteMedia = value => {
  const mediaUrl = String(value || '');
  if (!mediaUrl.startsWith(SESSION_INVITE_MEDIA_PREFIX)) {
    return null;
  }

  try {
    return JSON.parse(
      decodeURIComponent(mediaUrl.slice(SESSION_INVITE_MEDIA_PREFIX.length)),
    );
  } catch (_) {
    return null;
  }
};
