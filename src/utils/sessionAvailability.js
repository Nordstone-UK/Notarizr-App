import moment from 'moment';

export const buildSessionDate = (date, time) => {
  if (!date) {
    return null;
  }

  const target = moment(date);
  if (!target.isValid()) {
    return null;
  }

  const parsedTime = moment(time, ['HH:mm', 'h:mm A', moment.ISO_8601], true);
  if (parsedTime.isValid()) {
    target.set({
      hour: parsedTime.hour(),
      minute: parsedTime.minute(),
      second: 0,
      millisecond: 0,
    });
  }

  return target;
};

export const getSessionAvailability = ({date, time, now = moment()}) => {
  const sessionDate = buildSessionDate(date, time);
  const currentDate = moment.isMoment(now) ? now.clone() : moment(now);

  if (!sessionDate?.isValid() || !currentDate.isValid()) {
    return {
      canJoin: false,
      reason: 'missing',
      sessionDate,
      title: 'Session unavailable',
      actionLabel: 'Session unavailable',
      message: 'The appointment date is unavailable. Refresh the booking.',
    };
  }

  const opensAt = sessionDate.clone().subtract(30, 'minutes');
  const expiresAt = sessionDate.clone().add(60, 'minutes');

  if (currentDate.isBefore(opensAt)) {
    return {
      canJoin: false,
      reason: 'upcoming',
      opensAt,
      expiresAt,
      sessionDate,
      title: 'Session not open yet',
      actionLabel: 'Session not open yet',
      message: `This session opens ${opensAt.format(
        'ddd, MMM D [at] h:mm A',
      )}.`,
    };
  }

  if (currentDate.isAfter(expiresAt)) {
    return {
      canJoin: false,
      reason: 'past',
      opensAt,
      expiresAt,
      sessionDate,
      title: 'Session expired',
      actionLabel: 'Session expired',
      message: 'This appointment session has ended.',
    };
  }

  return {
    canJoin: true,
    reason: 'open',
    opensAt,
    expiresAt,
    sessionDate,
    title: 'Session open',
    actionLabel: 'Join secure session',
    message: 'The secure session is open.',
  };
};
