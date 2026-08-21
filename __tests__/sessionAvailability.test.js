import moment from 'moment';
import {
  buildSessionDate,
  getSessionAvailability,
} from '../src/utils/sessionAvailability';

describe('session availability', () => {
  const now = moment('2026-08-21T09:00:00');

  it('allows both participants to join on the appointment day', () => {
    expect(
      getSessionAvailability({
        date: '2026-08-21T00:00:00.000Z',
        time: '6:00 PM',
        now,
      }).canJoin,
    ).toBe(true);
  });

  it('blocks an appointment scheduled for the next day', () => {
    const result = getSessionAvailability({
      date: '2026-08-22T00:00:00.000Z',
      time: '2:30 PM',
      now,
    });

    expect(result.canJoin).toBe(false);
    expect(result.reason).toBe('upcoming');
  });

  it('blocks an appointment whose date has passed', () => {
    expect(
      getSessionAvailability({
        date: '2026-08-20T00:00:00.000Z',
        time: '2:30 PM',
        now,
      }).reason,
    ).toBe('past');
  });

  it('combines the booking date and time for display', () => {
    expect(
      buildSessionDate('2026-08-21T00:00:00.000Z', '6:00 PM').format(
        'YYYY-MM-DD HH:mm',
      ),
    ).toBe('2026-08-21 18:00');
  });
});
