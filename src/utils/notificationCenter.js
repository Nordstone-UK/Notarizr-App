import moment from 'moment';
import {parseSessionInviteMedia} from './sessionInvite';

const EVENT_WORDS = [
  ['observer', ['observer', 'invited you', 'invitation']],
  ['session', ['session', 'meeting', 'join', 'waiting room']],
  ['message', ['message', 'chat', 'replied']],
  ['payment', ['payment', 'paid', 'card', 'receipt']],
  ['document', ['document', 'upload', 'signature', 'signed']],
  [
    'booking',
    [
      'booking',
      'appointment',
      'accepted',
      'rejected',
      'cancelled',
      'completed',
    ],
  ],
];

const readDate = value => {
  const numericValue = Number(value);
  const date = moment(
    value && !Number.isNaN(numericValue) ? numericValue : value,
  );
  return date.isValid() ? date : moment();
};

export const inferNotificationType = (title, description, explicitType) => {
  if (explicitType && explicitType !== 'system') {
    return String(explicitType).toLowerCase();
  }

  const text = `${title || ''} ${description || ''}`.toLowerCase();
  return (
    EVENT_WORDS.find(([, words]) =>
      words.some(word => text.includes(word)),
    )?.[0] || 'system'
  );
};

const toDisplayItem = ({
  id,
  source,
  title,
  description,
  type,
  createdAt,
  read,
  metadata,
  booking,
}) => {
  const date = readDate(createdAt);
  return {
    id: String(id),
    source,
    title: title || 'Notarizr update',
    description: description || '',
    type: inferNotificationType(title, description, type),
    createdAt: date.valueOf(),
    displayTime: date.fromNow(),
    group: date.isSame(moment(), 'day') ? 'Today' : 'Earlier',
    read: Boolean(read),
    metadata: metadata || {},
    booking,
  };
};

export const normalizeApiNotification = item =>
  toDisplayItem({
    id: item?._id || item?.id || `api-${Date.now()}`,
    source: 'api',
    title: item?.title,
    description: item?.description || item?.body,
    type: item?.type,
    createdAt: item?.createdAt || item?.triggerDateTime || item?.updatedAt,
    read: item?.read || item?.isRead,
    metadata: item?.additionalData || item?.data,
  });

export const normalizePushNotification = (item, index = 0) => {
  const metadata = item?.additionalData || item?.data || {};
  return toDisplayItem({
    id:
      item?.notificationId ||
      item?.id ||
      metadata?.notificationId ||
      `push-${item?.sentTime || item?.createdAt || index}`,
    source: 'push',
    title: item?.title || metadata?.title,
    description: item?.body || item?.description || metadata?.description,
    type: metadata?.type || item?.type,
    createdAt: item?.sentTime || item?.createdAt || Date.now(),
    read: false,
    metadata,
  });
};

export const normalizeChatInviteNotification = (chat, currentUserId) => {
  const latestMessage = chat?.latestMessage;
  const senderId = String(latestMessage?.user?._id || '');
  const invite = parseSessionInviteMedia(latestMessage?.mediaUrl);
  const text = String(latestMessage?.text || '');
  const looksLikeObserverInvite =
    /observer|invited.+notary session|session invitation/i.test(text);

  if (
    !latestMessage?._id ||
    senderId === String(currentUserId || '') ||
    (!invite && !looksLikeObserverInvite)
  ) {
    return null;
  }

  const participant =
    chat?.users?.find(
      chatUser => String(chatUser?._id || '') !== String(currentUserId || ''),
    ) || chat?.users?.[0];
  const participantName = [participant?.first_name, participant?.last_name]
    .filter(Boolean)
    .join(' ');
  const conversation = {
    id: String(chat?._id || ''),
    name: participantName || 'Notarizr participant',
    avatar: participant?.profile_picture
      ? {uri: participant.profile_picture}
      : null,
    message: text,
    service: 'Session invitation',
    participant,
    raw: chat,
  };

  return toDisplayItem({
    id: `observer:${latestMessage._id}`,
    source: 'chat',
    title: 'Observer invitation',
    description: text || 'You were invited to observe a secure notary session.',
    type: 'observer',
    createdAt: latestMessage.createdAt,
    read: Boolean(chat?.isRead),
    metadata: {
      bookingId: invite?.bookingId,
      chatId: chat?._id,
      conversation,
      participant,
    },
  });
};

const bookingDate = booking =>
  booking?.date_of_booking ||
  booking?.time_of_booking ||
  booking?.date_time_session ||
  booking?.session_schedule;

const bookingServiceName = booking => {
  const service = String(
    booking?.service_type || booking?.service?.service_type || '',
  ).toLowerCase();
  return service.includes('mobile') ? 'mobile notary' : 'online notary';
};

const appointmentText = booking => {
  const date = readDate(bookingDate(booking));
  return date.isValid()
    ? date.format('ddd, MMM D [at] h:mm A')
    : 'your appointment';
};

export const buildBookingNotifications = (bookings, {isAgent = false} = {}) => {
  const seen = new Set();
  const notifications = [];

  (Array.isArray(bookings) ? bookings : []).forEach(booking => {
    const bookingId = String(booking?._id || '');
    if (!bookingId || seen.has(bookingId)) {
      return;
    }
    seen.add(bookingId);

    const status = String(booking?.status || 'pending').toLowerCase();
    const serviceName = bookingServiceName(booking);
    const when = appointmentText(booking);
    const messages = {
      pending: isAgent
        ? [
            'New booking request',
            `A client requested a ${serviceName} appointment.`,
          ]
        : [
            'Booking request sent',
            `Your ${serviceName} request is being reviewed.`,
          ],
      accepted: isAgent
        ? [
            'Booking ready',
            `Your ${serviceName} appointment is scheduled for ${when}.`,
          ]
        : [
            'Booking accepted',
            `Your ${serviceName} appointment is confirmed for ${when}.`,
          ],
      paid: [
        'Payment confirmed',
        `Payment for your appointment on ${when} was successful.`,
      ],
      completed: [
        'Session completed',
        `Your ${serviceName} appointment has been completed.`,
      ],
      rejected: [
        'Booking declined',
        `The ${serviceName} request was declined.`,
      ],
      cancelled: [
        'Booking cancelled',
        `The appointment scheduled for ${when} was cancelled.`,
      ],
      canceled: [
        'Booking cancelled',
        `The appointment scheduled for ${when} was cancelled.`,
      ],
    };
    const [title, description] = messages[status] || [
      'Booking updated',
      `Your ${serviceName} booking status changed to ${status}.`,
    ];

    notifications.push(
      toDisplayItem({
        id: `booking:${bookingId}:${status}`,
        source: 'booking',
        title,
        description,
        type: status === 'paid' ? 'payment' : 'booking',
        createdAt:
          booking?.updatedAt || booking?.createdAt || bookingDate(booking),
        read: false,
        metadata: {bookingId, status},
        booking,
      }),
    );

    const sessionDate = readDate(bookingDate(booking));
    const hoursUntilSession = sessionDate.diff(moment(), 'hours', true);
    if (
      ['accepted', 'paid'].includes(status) &&
      hoursUntilSession >= 0 &&
      hoursUntilSession <= 24
    ) {
      notifications.push(
        toDisplayItem({
          id: `session:${bookingId}:reminder`,
          source: 'booking',
          title: 'Session coming up',
          description: `Your secure notary session starts ${sessionDate.fromNow()}.`,
          type: 'session',
          createdAt: Date.now(),
          read: false,
          metadata: {bookingId, status},
          booking,
        }),
      );
    }
  });

  return notifications;
};

export const mergeNotifications = (...groups) => {
  const ids = new Set();
  const fingerprints = new Set();

  return groups
    .flat()
    .filter(Boolean)
    .sort((a, b) => b.createdAt - a.createdAt)
    .filter(item => {
      const fingerprint =
        `${item.type}:${item.title}:${item.description}`.toLowerCase();
      if (ids.has(item.id) || fingerprints.has(fingerprint)) {
        return false;
      }
      ids.add(item.id);
      fingerprints.add(fingerprint);
      return true;
    });
};
