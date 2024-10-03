const getState = async (query) => {
  setLoading(true);

  const state = extractState(bookingData.address);
  console.log('Extracted state:', state);

  let stateName = 'USA';

  const locationResponse = await handleGetLocation();
  console.log('Location response:', locationResponse);

  // Check if the location response is valid
  if (
    locationResponse &&
    locationResponse.results &&
    locationResponse.results.length > 0
  ) {
    const addressComponents = locationResponse.results[0]?.address_components;
    console.log('Address components:', addressComponents);

    if (addressComponents && addressComponents.length >= 5) {
      stateName = addressComponents[4]?.long_name || 'USA';
      console.log('State name retrieved:', stateName);
    } else {
      console.warn('Address components not found or incomplete:', addressComponents);
    }
  } else {
    console.warn('Location response invalid or empty:', locationResponse);
  }

  const data = await fetchDocumentTypes(page, Limit, stateName, query);
  const modifiedDocuments = data.documentTypes.map(doc => ({
    ...doc,
    key: doc._id,
    value: `${doc.name} - $${doc.statePrices[0].price}`,
  }));

  setTotalDocs(data.totalDocs);
  setDocumentArray(modifiedDocuments);
  setLoading(false);

  if (Limit < data?.totalDocs) {
    setLimit(Limit + DOCUMENTS_PER_LOAD);
  }
};

function extractState(address) {
  if (!address) {
    console.warn('Address is undefined or null:', address);
    return null; // or return a default state if applicable
  }

  const parts = address.split(' ');
  if (parts.length >= 2) {
    const state = parts[parts.length - 2];
    return state;
  }
  return null;
}
