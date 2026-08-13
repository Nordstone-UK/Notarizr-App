import AsyncStorage from '@react-native-async-storage/async-storage';
import {Buffer} from 'buffer';
import {BaseURL} from './ApiUtils';
import {uriToBlob} from './ImagePicker';

const CREATE_UPLOAD = `
  mutation CreateMediaUpload(
    $fileName: String!
    $contentType: String!
    $purpose: String!
  ) {
    createMediaUpload(
      fileName: $fileName
      contentType: $contentType
      purpose: $purpose
    ) {
      uploadUrl
      publicUrl
    }
  }
`;

const inferContentType = (fileName = '') => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  if (extension === 'png') {
    return 'image/png';
  }
  if (extension === 'webp') {
    return 'image/webp';
  }
  if (extension === 'jpg' || extension === 'jpeg') {
    return 'image/jpeg';
  }
  if (extension === 'pdf') {
    return 'application/pdf';
  }
  if (extension === 'doc') {
    return 'application/msword';
  }
  if (extension === 'docx') {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }
  return 'application/octet-stream';
};

const requestUpload = async (fileName, contentType, purpose) => {
  const token = await AsyncStorage.getItem('token');
  if (!token) {
    throw new Error('Your session expired. Please log in again.');
  }

  const response = await fetch(BaseURL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: CREATE_UPLOAD,
      variables: {fileName, contentType, purpose},
    }),
  });
  const payload = await response.json();
  const upload = payload?.data?.createMediaUpload;
  if (!response.ok || payload?.errors?.length || !upload?.uploadUrl) {
    throw new Error(
      payload?.errors?.[0]?.message || 'Unable to prepare file upload.',
    );
  }
  return upload;
};

const uploadToSpaces = async ({body, fileName, contentType, purpose}) => {
  const upload = await requestUpload(fileName, contentType, purpose);
  const response = await fetch(upload.uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
      'x-amz-acl': 'public-read',
    },
    body,
  });
  if (!response.ok) {
    throw new Error(`DigitalOcean upload failed (${response.status}).`);
  }
  return upload.publicUrl;
};

const blobDetails = (blob, fallbackName) => {
  const name = blob?._data?.name || blob?.name || fallbackName;
  const contentType = blob?.type || blob?._data?.type || inferContentType(name);
  return {name, contentType};
};

export const uploadFileToSpaces = async ({file}) => {
  const {name, contentType} = blobDetails(file, `verification-${Date.now()}`);
  return uploadToSpaces({
    body: file,
    fileName: name,
    contentType,
    purpose: 'verification',
  });
};

export const uploadDocumentToSpaces = async ({file}) => {
  const blob = await uriToBlob(file);
  const {name, contentType} = blobDetails(blob, `document-${Date.now()}.pdf`);
  return uploadToSpaces({
    body: blob,
    fileName: name,
    contentType,
    purpose: 'document',
  });
};

export const uploadSignedDocumentToSpaces = async base64Data => {
  const bytes = Buffer.from(base64Data, 'base64');
  const body = new Blob(
    [bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)],
    {
      type: 'application/pdf',
    },
  );
  return uploadToSpaces({
    body,
    fileName: `signed-document-${Date.now()}.pdf`,
    contentType: 'application/pdf',
    purpose: 'document',
  });
};

export const uploadSignatureToSpaces = async base64Data => {
  const cleanData = base64Data.replace('data:image/png;base64,', '');
  const bytes = Buffer.from(cleanData, 'base64');
  const body = new Blob(
    [bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)],
    {
      type: 'image/png',
    },
  );
  return uploadToSpaces({
    body,
    fileName: `signature-${Date.now()}.png`,
    contentType: 'image/png',
    purpose: 'signature',
  });
};
