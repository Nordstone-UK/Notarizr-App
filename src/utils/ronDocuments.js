export const documentUri = document => {
  if (typeof document === 'string') {
    return /^(https?:\/\/|file:\/\/|\/)/i.test(document.trim())
      ? document.trim()
      : null;
  }
  if (!document || typeof document !== 'object') return null;
  return documentUri(document.url || document.uri || document.value);
};

export const getRonDocuments = record => {
  const documents = [];
  const append = (value, key) => {
    const uri = documentUri(value);
    if (!uri || documents.some(document => document.uri === uri)) return;
    let filename = uri.split('?')[0].split('/').pop() || 'Document.pdf';
    try {
      filename = decodeURIComponent(filename);
    } catch {}
    documents.push({
      uri,
      name: value?.name || value?.fileName || filename,
      type:
        value?.type ||
        (/\.(png|jpe?g|webp)(\?|$)/i.test(uri) ? 'image' : 'application/pdf'),
      additional: String(key).startsWith('additional-'),
    });
  };
  [record?.client_documents, record?.documents, record?.agent_document].forEach(
    collection => {
      if (documentUri(collection)) {
        append(collection, 'main');
      } else if (collection && typeof collection === 'object') {
        Object.entries(collection).forEach(([key, value]) =>
          append(value, value?.key || key),
        );
      }
    },
  );
  return documents;
};
