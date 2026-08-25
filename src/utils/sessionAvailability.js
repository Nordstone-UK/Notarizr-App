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
      message: 'The appointment date is unavailable. Refresh the booking.',
    };
  }

  const opensAt = sessionDate.clone().subtract(30, 'minutes');

  if (currentDate.isBefore(opensAt)) {
    return {
      canJoin: false,
      reason: 'upcoming',
      opensAt,
      sessionDate,
      message: `This session opens ${opensAt.format(
        'ddd, MMM D [at] h:mm A',
      )}.`,
    };
  }

  if (currentDate.isAfter(sessionDate.clone().endOf('day'))) {
    return {
      canJoin: false,
      reason: 'past',
      opensAt,
      sessionDate,
      message: 'This appointment date has passed.',
    };
  }

  return {
    canJoin: true,
    reason: 'open',
    opensAt,
    sessionDate,
    message: 'The secure session is open.',
  };
};
