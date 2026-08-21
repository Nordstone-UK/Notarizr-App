import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBlobUtil from 'react-native-blob-util';
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
    const serverMessage = payload?.errors?.[0]?.message;
    if (serverMessage === 'DIGITALOCEAN_SPACES_NOT_CONFIGURED') {
      throw new Error(
        'Document storage is not configured on the server. Please try again after storage is enabled.',
      );
    }
    throw new Error(serverMessage || 'Unable to prepare file upload.');
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

const uploadBase64ToSpaces = async ({
  base64Data,
  fileName,
  contentType,
  purpose,
}) => {
  const upload = await requestUpload(fileName, contentType, purpose);
  const temporaryPath = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${fileName}`;

  await ReactNativeBlobUtil.fs.writeFile(temporaryPath, base64Data, 'base64');

  try {
    const response = await ReactNativeBlobUtil.fetch(
      'PUT',
      upload.uploadUrl,
      {
        'Content-Type': contentType,
        'x-amz-acl': 'public-read',
      },
      ReactNativeBlobUtil.wrap(temporaryPath),
    );
    const status = response.info().status;
    if (status < 200 || status >= 300) {
      throw new Error(`DigitalOcean upload failed (${status}).`);
    }
    return upload.publicUrl;
  } finally {
    const exists = await ReactNativeBlobUtil.fs.exists(temporaryPath);
    if (exists) {
      await ReactNativeBlobUtil.fs.unlink(temporaryPath);
    }
  }
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

export const uploadDocumentToSpaces = async ({
  file,
  fileName,
  contentType: selectedContentType,
}) => {
  const blob = await uriToBlob(file);
  const {name, contentType} = blobDetails(
    blob,
    fileName || `document-${Date.now()}.pdf`,
  );
  return uploadToSpaces({
    body: blob,
    fileName: fileName || name,
    contentType: selectedContentType || contentType,
    purpose: 'document',
  });
};

export const uploadSignedDocumentToSpaces = async base64Data => {
  return uploadBase64ToSpaces({
    base64Data,
    fileName: `signed-document-${Date.now()}.pdf`,
    contentType: 'application/pdf',
    purpose: 'document',
  });
};

export const uploadSignatureToSpaces = async base64Data => {
  const cleanData = base64Data.replace('data:image/png;base64,', '');
  return uploadBase64ToSpaces({
    base64Data: cleanData,
    fileName: `signature-${Date.now()}.png`,
    contentType: 'image/png',
    purpose: 'signature',
  });
};
