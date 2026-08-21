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

  const dayDifference = sessionDate
    .clone()
    .startOf('day')
    .diff(currentDate.clone().startOf('day'), 'days');

  if (dayDifference > 0) {
    return {
      canJoin: false,
      reason: 'upcoming',
      sessionDate,
      message: `This session opens on ${sessionDate.format('ddd, MMM D')}.`,
    };
  }

  if (dayDifference < 0) {
    return {
      canJoin: false,
      reason: 'past',
      sessionDate,
      message: 'This appointment date has passed.',
    };
  }

  return {
    canJoin: true,
    reason: 'today',
    sessionDate,
    message: 'The secure session is available today.',
  };
};
