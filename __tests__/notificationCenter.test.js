import {
  mergeNotifications,
  normalizeChatInviteNotification,
} from '../src/utils/notificationCenter';
import {buildSessionInviteMedia} from '../src/utils/sessionInvite';

const observerChat = {
  _id: 'chat-1',
  users: [
    {_id: 'host-1', first_name: 'Jane', last_name: 'Chen'},
    {_id: 'observer-1', first_name: 'Alex', last_name: 'Morgan'},
  ],
  latestMessage: {
    _id: 'message-1',
    text: 'You were invited as an observer to a secure notary session.',
    mediaUrl: buildSessionInviteMedia({bookingId: 'booking-1'}),
    createdAt: '2026-08-25T10:00:00.000Z',
    user: {_id: 'host-1'},
  },
  isRead: false,
};

describe('notification center', () => {
  it('turns a persisted observer chat invitation into a notification', () => {
    const notification = normalizeChatInviteNotification(
      observerChat,
      'observer-1',
    );

    expect(notification).toMatchObject({
      id: 'observer:message-1',
      source: 'chat',
      type: 'observer',
      read: false,
      metadata: {
        bookingId: 'booking-1',
        chatId: 'chat-1',
      },
    });
    expect(notification.metadata.participant._id).toBe('host-1');
  });

  it('does not notify the person who sent the invitation', () => {
    expect(normalizeChatInviteNotification(observerChat, 'host-1')).toBeNull();
  });

  it('deduplicates equivalent events from multiple delivery channels', () => {
    const event = normalizeChatInviteNotification(observerChat, 'observer-1');
    expect(mergeNotifications(event, {...event, id: 'push-copy'})).toHaveLength(
      1,
    );
  });
});
