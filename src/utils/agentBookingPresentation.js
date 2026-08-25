import {
  formatBookingDate,
  formatBookingTime,
  getBookingLocation,
  getBookingServiceType,
} from './bookingPresentation';

export const getBookingClient = item =>
  item?.booked_by ||
  item?.client ||
  item?.booked_for || {
    first_name: item?.first_name,
    last_name: item?.last_name,
  };

export {getBookingServiceType};

export const normalizeAgentBooking = item => {
  const client = getBookingClient(item);
  const serviceType = getBookingServiceType(item);
  const dateValue =
    item?.date_of_booking || item?.date_time_session || item?.preferredDate;
  const timeValue =
    item?.time_of_booking || item?.date_time_session || item?.preferredTime;
  const clientName = [client?.first_name, client?.last_name]
    .filter(Boolean)
    .join(' ');

  return {
    ...item,
    agentName: clientName || 'Notarizr client',
    avatar: client?.profile_picture ? {uri: client.profile_picture} : null,
    displayDate: formatBookingDate(dateValue),
    displayTime: formatBookingTime({
      time_of_booking: timeValue,
      date_time_session: item?.date_time_session,
      date_of_booking: item?.date_of_booking,
    }),
    location: getBookingLocation(item),
    raw: item,
    service_type: serviceType,
  };
};
