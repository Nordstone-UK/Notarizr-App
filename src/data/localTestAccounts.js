const normalizePhone = value => String(value || '').replace(/\D/g, '');

export const LOCAL_TEST_ACCOUNTS = {
  12025550147: {
    _id: 'local-client-alex',
    account_type: 'client',
    first_name: 'Alex',
    last_name: 'Morgan',
    email: 'alex.us.local@notarizr.test',
    phone_number: '+12025550147',
    location: 'San Francisco, CA',
    addresses: [
      {
        _id: 'local-client-address',
        location: '120 Market Street, San Francisco, CA 94105',
      },
    ],
    isBlocked: false,
    isHomePreview: true,
    isVerified: true,
  },
  919600395864: {
    _id: 'local-notary-maya',
    account_type: 'individual-agent',
    first_name: 'Maya',
    last_name: 'Chen',
    email: 'maya.local@notarizr.test',
    phone_number: '+919600395864',
    state: 'CA',
    location: 'San Francisco, CA',
    description: 'Mobile and remote online notary',
    isBlocked: false,
    isHomePreview: true,
    isSubscribed: true,
    isVerified: true,
  },
};

export const getLocalTestAccount = phone =>
  LOCAL_TEST_ACCOUNTS[normalizePhone(phone)] || null;

export const getLocalTestAccountById = id =>
  Object.values(LOCAL_TEST_ACCOUNTS).find(account => account._id === id) ||
  null;

export const isLocalTestPhone = phone => Boolean(getLocalTestAccount(phone));
