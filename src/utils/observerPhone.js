export const normalizeObserverPhone = value => {
  const rawValue = String(value || '').trim();
  const digits = rawValue.replace(/\D/g, '');

  return digits ? `+${digits}` : '';
};

export const isValidObserverPhone = value =>
  /^\+\d{7,15}$/.test(normalizeObserverPhone(value));

export const getObserverPhone = observer => {
  const value =
    typeof observer === 'string'
      ? observer
      : observer?.phone_number || observer?.phone || observer?.value || '';

  return isValidObserverPhone(value) ? normalizeObserverPhone(value) : '';
};
