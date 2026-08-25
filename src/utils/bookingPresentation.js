import moment from 'moment';

const EMPTY_DATE = 'Date to be confirmed';
const EMPTY_TIME = 'Time to be confirmed';

export const getBookingDisplayId = booking => {
  const value =
    booking?._id ?? booking?.id ?? booking?.bookingId ?? booking?.reference;
  const normalized = String(value || 'Booking')
    .replace(/^#/, '')
    .replace(/^booking[-_]/i, '');

  return (
    normalized.length > 8 ? normalized.slice(-8) : normalized
  ).toUpperCase();
};

const parseDateValue = value => {
  if (!value) {
    return null;
  }

  const parsed = moment(value, moment.ISO_8601, true);
  return parsed.isValid() ? parsed : null;
};

const parseTimeValue = value => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    const parsed = moment(value);
    return parsed.isValid() ? parsed : null;
  }

  const normalized = String(value).trim();
  if (!normalized) {
    return null;
  }

  const isoTime = moment(normalized, moment.ISO_8601, true);
  if (isoTime.isValid()) {
    return isoTime;
  }

  const clockTime = moment(
    normalized.toUpperCase(),
    ['h:mm A', 'hh:mm A', 'h:mmA', 'hh:mmA', 'H:mm', 'HH:mm', 'Hmm', 'HHmm'],
    true,
  );

  return clockTime.isValid() ? clockTime : null;
};

export const formatBookingDate = bookingOrValue => {
  const values =
    bookingOrValue && typeof bookingOrValue === 'object'
      ? [
          bookingOrValue.date_of_booking,
          bookingOrValue.date_time_session,
          bookingOrValue.preferredDate,
          bookingOrValue.displayDate,
        ]
      : [bookingOrValue];

  const parsed = values.map(parseDateValue).find(Boolean);
  return parsed ? parsed.format('MMM D, YYYY') : EMPTY_DATE;
};

export const formatBookingTime = bookingOrValue => {
  const values =
    bookingOrValue && typeof bookingOrValue === 'object'
      ? [
          bookingOrValue.time_of_booking,
          bookingOrValue.date_time_session,
          bookingOrValue.date_of_booking,
          bookingOrValue.preferredTime,
          bookingOrValue.displayTime,
        ]
      : [bookingOrValue];

  const parsed = values.map(parseTimeValue).find(Boolean);
  return parsed ? parsed.format('h:mm A') : EMPTY_TIME;
};

export const getBookingServiceType = booking =>
  booking?.service_type || booking?.service?.service_type || 'ron';

export const getBookingLocation = booking => {
  const serviceType = getBookingServiceType(booking);
  if (serviceType !== 'mobile_notary') {
    return 'Secure video appointment';
  }

  if (booking?.__typename === 'Allocation' && booking?.address) {
    return typeof booking.address === 'string'
      ? booking.address
      : booking.address.location || booking.address.formatted_address;
  }

  const client = booking?.booked_by || booking?.client || booking?.booked_for;
  const addressId =
    typeof booking?.address === 'string'
      ? booking.address
      : booking?.address?._id;
  const selectedAddress = client?.addresses?.find(
    address => String(address?._id) === String(addressId),
  );

  return (
    selectedAddress?.location ||
    selectedAddress?.formatted_address ||
    booking?.booked_for?.location ||
    booking?.address?.location ||
    booking?.address?.formatted_address ||
    booking?.location ||
    client?.location ||
    client?.addresses?.[0]?.location ||
    'Address to be confirmed'
  );
};
