import moment from 'moment';
import {
  buildSessionDate,
  getSessionAvailability,
} from '../src/utils/sessionAvailability';

describe('session availability', () => {
  it('allows both participants to join within 30 minutes of the appointment', () => {
    const result = getSessionAvailability({
      date: '2026-08-21T00:00:00.000Z',
      time: '6:00 PM',
      now: moment('2026-08-21T17:30:00'),
    });

    expect(result.canJoin).toBe(true);
    expect(result.reason).toBe('open');
    expect(result.actionLabel).toBe('Join secure session');
  });

  it('blocks an appointment before its join window opens', () => {
    const result = getSessionAvailability({
      date: '2026-08-21T00:00:00.000Z',
      time: '6:00 PM',
      now: moment('2026-08-21T17:29:59'),
    });

    expect(result.canJoin).toBe(false);
    expect(result.reason).toBe('upcoming');
    expect(result.actionLabel).toBe('Session not open yet');
  });

  it('marks an appointment as expired after its one-hour session window', () => {
    const result = getSessionAvailability({
      date: '2026-08-24T00:00:00.000Z',
      time: '5:30 PM',
      now: moment('2026-08-25T16:28:00'),
    });

    expect(result.canJoin).toBe(false);
    expect(result.reason).toBe('past');
    expect(result.title).toBe('Session expired');
    expect(result.actionLabel).toBe('Session expired');
  });

  it('combines the booking date and time for display', () => {
    expect(
      buildSessionDate('2026-08-21T00:00:00.000Z', '6:00 PM').format(
        'YYYY-MM-DD HH:mm',
      ),
    ).toBe('2026-08-21 18:00');
  });
});
