export const REQUIRED_AGENT_DOCUMENTS = [
  {
    key: 'photoId',
    title: 'Government photo ID',
  },
  {
    key: 'commissionCertificate',
    title: 'Commission certificate',
  },
  {
    key: 'ronApproval',
    title: 'RON approval',
  },
  {
    key: 'bond',
    title: 'Bond document',
  },
  {
    key: 'insurance',
    title: 'Insurance evidence',
  },
  {
    key: 'training',
    title: 'Training evidence',
  },
];

export const REQUIRED_COMMISSION_FIELDS = [
  {key: 'state', title: 'Commission state'},
  {key: 'county', title: 'County'},
  {key: 'city', title: 'City'},
  {key: 'zipCode', title: 'ZIP code'},
  {key: 'number', title: 'Commission number'},
  {key: 'issueDate', title: 'Issue date'},
  {key: 'expirationDate', title: 'Expiration date'},
  {key: 'ronStatus', title: 'RON status'},
];

export const getAgentCredentialStatus = user => {
  const onboarding = user?.notaryOnboarding || {};
  const credentials = onboarding?.credentials || {};
  const commission = onboarding?.commission || {};

  const missingDocuments = REQUIRED_AGENT_DOCUMENTS.filter(item => {
    if (item.key === 'photoId') {
      return !credentials.photoId && !user?.photoId;
    }
    if (item.key === 'commissionCertificate') {
      return !credentials.commissionCertificate && !user?.certificate_url;
    }
    return !credentials[item.key];
  });

  const missingCommission = REQUIRED_COMMISSION_FIELDS.filter(item => {
    if (item.key === 'state') {
      return !commission.state && !user?.state;
    }
    if (item.key === 'zipCode') {
      return !commission.zipCode && !user?.zipCode;
    }
    return !commission[item.key];
  });

  const documentsComplete =
    missingDocuments.length === 0 && missingCommission.length === 0;
  const approved =
    onboarding?.approvalStatus === 'approved' || user?.isVerified;

  return {
    approved,
    documentsComplete,
    missingCommission,
    missingDocuments,
    readyForBookings: documentsComplete && approved && !user?.isBlocked,
    status:
      onboarding?.approvalStatus ||
      (user?.isVerified ? 'approved' : 'not_started'),
  };
};

export const getAgentCredentialBlockMessage = user => {
  const status = getAgentCredentialStatus(user);

  if (user?.isBlocked) {
    return {
      title: 'Account access paused',
      body: 'Please contact Notarizr support before accepting bookings.',
    };
  }

  if (!status.documentsComplete) {
    const missing = [
      ...status.missingDocuments.map(item => item.title),
      ...status.missingCommission.map(item => item.title),
    ];
    return {
      title: 'Credentials required',
      body: `Upload required agent documents before accepting bookings. Missing: ${missing
        .slice(0, 3)
        .join(', ')}${missing.length > 3 ? '...' : ''}`,
    };
  }

  if (!status.approved) {
    return {
      title: 'Verification under review',
      body: 'Your documents are saved. Admin approval is required before accepting bookings.',
    };
  }

  return null;
};
