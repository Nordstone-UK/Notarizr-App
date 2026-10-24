import {getRonDocuments, documentUri} from '../src/utils/ronDocuments';

test('keeps original documents when optional uploads are added and removes duplicates', () => {
  const original = 'https://storage.example/main%20contract.pdf?signature=123';
  const docs = getRonDocuments({
    client_documents: {
      contract: original,
      'additional-123': 'https://storage.example/extra.pdf',
    },
    agent_document: [
      original,
      {name: 'Notary document', url: 'https://storage.example/notary.pdf'},
    ],
  });
  expect(docs).toHaveLength(3);
  expect(docs[0]).toMatchObject({
    uri: original,
    name: 'main contract.pdf',
    additional: false,
  });
  expect(docs.filter(doc => !doc.additional)).toHaveLength(2);
  expect(docs[1].additional).toBe(true);
});

test('supports document metadata, array key/value pairs and booking documents', () => {
  const docs = getRonDocuments({
    documents: [
      {name: 'Signed agreement', value: 'https://storage.example/a.pdf'},
      {key: 'additional-9', value: 'https://storage.example/photo.png'},
      null,
    ],
  });
  expect(docs[0].name).toBe('Signed agreement');
  expect(docs[1]).toMatchObject({additional: true, type: 'image'});
  expect(documentUri({value: 'not-a-url'})).toBeNull();
  expect(documentUri(null)).toBeNull();
});
