import moment from 'moment';

const formatMessageTime = createdAt => {
  if (!createdAt) {
    return '';
  }

  const numericDate = Number(createdAt);
  const date = moment(Number.isNaN(numericDate) ? createdAt : numericDate);
  return date.isValid() ? date.fromNow(true) : '';
};

export const normalizeChatConversation = (
  item,
  currentUserId,
  participantLabel,
) => {
  const participant =
    item.users?.find(chatUser => chatUser._id !== currentUserId) ||
    item.users?.[0] ||
    {};
  const recipientId = item.isReadSendTo?._id;
  const name = [participant.first_name, participant.last_name]
    .filter(Boolean)
    .join(' ');

  return {
    id: item._id,
    name: name || participantLabel,
    avatar: participant.profile_picture
      ? {uri: participant.profile_picture}
      : null,
    message:
      item.latestMessage?.text ||
      (item.latestMessage?.mediaUrl ? 'Photo' : 'Start the conversation'),
    service: participantLabel,
    time: formatMessageTime(item.latestMessage?.createdAt),
    unreadCount: !item.isRead && recipientId === currentUserId ? 1 : 0,
    online: Boolean(participant.isOnline),
    participant,
    raw: item,
  };
};
