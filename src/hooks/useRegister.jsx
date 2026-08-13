import {useMutation} from '@apollo/client';
import {REGISTER_USER} from '../../request/mutations/register.mutation';
import {compressImage} from '../utils/ImageResizer';
import {
  uploadDocumentToSpaces,
  uploadFileToSpaces,
} from '../utils/spacesHelper';
import DocumentPicker from 'react-native-document-picker';
import {useCallback} from 'react';
import useLogin from './useLogin';
import {
  UPDATE_AGENT_PHOTO_AND_CERTIFICATE,
  UPDATE_NOTARY_SEAL,
} from '../../request/mutations/updateNotarysign.mutation';
import {CREATE_MEDIA_UPLOAD} from '../../request/mutations/mediaUpload.mutation';

const useRegister = () => {
  const {saveAccessTokenToStorage} = useLogin();
  const [register] = useMutation(REGISTER_USER);
  const [updateAgentPhotoAndCertificate] = useMutation(
    UPDATE_AGENT_PHOTO_AND_CERTIFICATE,
  );
  const [updateNotarySeal] = useMutation(UPDATE_NOTARY_SEAL);
  const [createMediaUpload] = useMutation(CREATE_MEDIA_UPLOAD);

  const handleCompression = async image => {
    console.log('handleCompression', image);

    try {
      const compressedImage = await compressImage(image);
      // console.log(compressImage);
      return compressedImage;
    } catch (error) {
      console.error(error);
    }
  };

  const uploadMedia = async (imageBlob, purpose = 'profile') => {
    if (!imageBlob) {
      throw new Error('No image was selected.');
    }

    const contentType =
      imageBlob.type || imageBlob?._data?.type || 'image/jpeg';
    const originalName = imageBlob?._data?.name || `image-${Date.now()}.jpg`;
    const {data, errors} = await createMediaUpload({
      variables: {fileName: originalName, contentType, purpose},
    });
    const upload = data?.createMediaUpload;
    if (errors?.length || !upload?.uploadUrl || !upload?.publicUrl) {
      throw new Error(
        errors?.[0]?.message || 'Unable to prepare image upload.',
      );
    }

    const response = await fetch(upload.uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
        'x-amz-acl': 'public-read',
      },
      body: imageBlob,
    });
    if (!response.ok) {
      throw new Error(`Image upload failed (${response.status}).`);
    }
    return upload.publicUrl;
  };
  const uploadFilesToStorage = async fileUri => {
    const url = await uploadFileToSpaces({
      file: fileUri,
    });
    return url;
  };
  const uploadDocumentToStorage = async fileUri => {
    const url = await uploadDocumentToSpaces({
      file: fileUri,
    });
    return url;
  };
  const uploadImageToStorage = async fileUri => {
    const url = await uploadDocumentToSpaces({
      file: fileUri,
    });
    return url;
  };
  const handleRegister = async variables => {
    try {
      const request = {
        variables: {
          ...variables,
        },
      };
      console.log('redfdldldfldfld', request);
      const {data} = await register(request);
      if (data?.register?.status === '201') {
        await saveAccessTokenToStorage(data?.register?.access_token);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };
  const handleUpdatecertificate = async variables => {
    try {
      const request = {
        variables,
      };

      const {data} = await updateAgentPhotoAndCertificate(request);
      console.log('dffffaaaaaaaaaaaaaa', data);
      if (data?.updateAgentPhotoAndCertificate?.status === '200') {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };
  const handleUpdateSeal = async variables => {
    try {
      const request = {
        variables,
      };

      const {data} = await updateNotarySeal(request);
      console.log('dffffaaaaaaaaaddddddddddddsssssaaaaa', data);
      if (data?.updateNotarySeal?.status === '204') {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  const uploadFiles = useCallback(async () => {
    try {
      const response = await DocumentPicker.pick({
        presentationStyle: 'fullScreen',
        allowMultiSelection: false,
      });
      return response[0].uri;
    } catch (err) {
      console.warn(err);
    }
  }, []);

  const uploadMultipleFiles = useCallback(async () => {
    try {
      const results = await DocumentPicker.pick({
        allowMultiSelection: true,
      });
      const documentUris = results.map(result => {
        return result.uri;
      });
      return documentUris;
    } catch (err) {
      console.warn(err);
    }
  }, []);

  const pickDocumentDetails = useCallback(
    async (allowMultiSelection = true) => {
      try {
        const results = await DocumentPicker.pick({
          allowMultiSelection,
          copyTo: 'cachesDirectory',
          type: [DocumentPicker.types.allFiles],
        });

        return results.map(result => ({
          name: result.name || 'Untitled document',
          size: result.size || 0,
          type: result.type || '',
          uri: result.fileCopyUri || result.uri,
          url: result.fileCopyUri || result.uri,
        }));
      } catch (error) {
        if (!DocumentPicker.isCancel(error)) {
          console.warn('Document selection failed:', error);
        }
        return [];
      }
    },
    [],
  );
  const uploadAllDocuments = async documentURIs => {
    try {
      const uploadedFiles = await Promise.all(
        documentURIs.map(async (fileUri, index) => {
          const uploadedLink = await uploadDocumentToStorage(fileUri);
          return {
            id: index + 1,
            name: `Document ${index + 1}`,
            url: uploadedLink,
          };
        }),
      );

      const uploadedFilesArray = uploadedFiles.map(({id, name, url}) => ({
        id,
        name,
        url,
      }));

      return uploadedFilesArray;
    } catch (error) {
      console.error('Error uploading documents:', error);
      // Handle upload error
    }
  };

  // const uploadAllDocuments = async documentURIs => {
  //   try {
  //     const uploadedFiles = await Promise.all(
  //       documentURIs.map(async fileUri => {
  //         const uploadedLink = await uploadDocumentToStorage(fileUri);

  //         return uploadedLink;
  //       }),
  //     );

  //     const uploadedFilesObject = {};
  //     uploadedFiles.forEach((link, index) => {
  //       uploadedFilesObject[`file${index + 1}`] = link;
  //     });
  //     console.log('Uploaded Files Object:', uploadedFilesObject);
  //     return uploadedFilesObject;
  //   } catch (error) {
  //     console.error('Error uploading documents:', error);
  //     // Handle upload error
  //   }
  // };
  const uploadDocArray = async documentURIs => {
    try {
      const uploadedFiles = await Promise.all(
        documentURIs.map(async fileUri => {
          const uploadedLink = await uploadDocumentToStorage(fileUri);
          return uploadedLink;
        }),
      );

      return uploadedFiles;
    } catch (error) {
      console.error('Error uploading documents:', error);
      // Handle upload error
    }
  };
  return {
    handleCompression,
    uploadMedia,
    handleRegister,
    uploadFiles,
    uploadFilesToStorage,
    uploadMultipleFiles,
    pickDocumentDetails,
    uploadDocumentToStorage,
    uploadAllDocuments,
    uploadDocArray,
    uploadImageToStorage,
    handleUpdateSeal,
    handleUpdatecertificate,
  };
};

export default useRegister;
