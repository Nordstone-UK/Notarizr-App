import {
  getBookingLocation,
  getBookingServiceType,
} from '../src/utils/bookingPresentation';

describe('booking presentation', () => {
  it('labels an in-person session as in-person rather than video', () => {
    const booking = {session_mode: 'in_person'};

    expect(getBookingLocation(booking)).toBe(
      'In-person electronic notarization',
    );
  });

  it('keeps remote sessions labeled as secure video appointments', () => {
    const booking = {session_mode: 'remote_online'};

    expect(getBookingLocation(booking)).toBe('Secure video appointment');
  });

  it('keeps mobile notary address lookup behavior', () => {
    const booking = {
      service_type: 'mobile_notary',
      address: 'address-1',
      booked_by: {
        addresses: [{_id: 'address-1', location: '123 Main St'}],
      },
    };

    expect(getBookingServiceType(booking)).toBe('mobile_notary');
    expect(getBookingLocation(booking)).toBe('123 Main St');
  });
});
