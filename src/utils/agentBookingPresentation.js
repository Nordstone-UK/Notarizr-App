import moment from 'moment';

export const getBookingClient = item =>
  item?.booked_by ||
  item?.client ||
  item?.booked_for || {
    first_name: item?.first_name,
    last_name: item?.last_name,
  };

export const getBookingServiceType = item =>
  item?.service_type || item?.service?.service_type || 'ron';

const getBookingLocation = (item, client, serviceType) => {
  if (serviceType !== 'mobile_notary') {
    return 'Secure video appointment';
  }

  if (item?.__typename === 'Allocation' && item?.address) {
    return item.address;
  }

  const selectedAddress = client?.addresses?.find(
    address => address._id === item?.address,
  );
  return (
    selectedAddress?.location ||
    client?.addresses?.[0]?.location ||
    item?.booked_for?.location ||
    client?.location ||
    (typeof item?.address === 'string' ? item.address : null) ||
    'Address to be confirmed'
  );
};

const formatDate = value => {
  const date = moment(value);
  return date.isValid() ? date.format('MMM D, YYYY') : 'Date to be confirmed';
};

const formatTime = value => {
  const date = moment(value);
  return date.isValid()
    ? date.format('h:mm A')
    : value || 'Time to be confirmed';
};

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
    displayDate: formatDate(dateValue),
    displayTime: formatTime(timeValue),
    location: getBookingLocation(item, client, serviceType),
    raw: item,
    service_type: serviceType,
  };
};
