import {useMutation} from '@apollo/client';
import {REGISTER_USER} from '../../request/mutations/register.mutation';
import {compressImage} from '../utils/ImageResizer';
import {uploadDirectOnS3, uploadDocumentsOnS3} from '../utils/s3Helper';
import DocumentPicker from 'react-native-document-picker';
import React, {useCallback} from 'react';
import useLogin from './useLogin';
import Toast from 'react-native-toast-message';
import {
  UPDATE_AGENT_PHOTO_AND_CERTIFICATE,
  UPDATE_NOTARY_SEAL,
} from '../../request/mutations/updateNotarysign.mutation';

const useRegister = () => {
  const {saveAccessTokenToStorage} = useLogin();
  const [register] = useMutation(REGISTER_USER);
  const [updateAgentPhotoAndCertificate] = useMutation(
    UPDATE_AGENT_PHOTO_AND_CERTIFICATE,
  );
  const [updateNotarySeal] = useMutation(UPDATE_NOTARY_SEAL);

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

  const uploadBlobToS3 = async imageUri => {
    const title = 'Profile Pictures';
    const type = 'images';
    const url = await uploadDirectOnS3({
      file: imageUri,
      title: title,
      type: type,
    });
    return url;
  };
  const uploadFilestoS3 = async (fileUri, agentName) => {
    const title = 'Documents';
    const type = agentName;
    const url = await uploadDirectOnS3({
      file: fileUri,
      title: title,
      type: type,
    });
    return url;
  };
  const uploadDocmmentToS3 = async fileUri => {
    const title = 'Booking';
    const type = 'Documents';

    const url = await uploadDocumentsOnS3({
      file: fileUri,
      title: title,
      type: type,
    });
    return url;
  };
  const uploadimageToS3 = async fileUri => {
    const title = 'signs';
    const type = 'stamping';

    const url = await uploadDocumentsOnS3({
      file: fileUri,
      title: title,
      type: type,
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

      const {data} = await register(request);
      if (data?.register?.status === '201') {
        saveAccessTokenToStorage(data?.register?.access_token);
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
        saveAccessTokenToStorage(data?.register?.access_token);
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
        saveAccessTokenToStorage(data?.register?.access_token);
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
  const uploadAllDocuments = async documentURIs => {
    try {
      const uploadedFiles = await Promise.all(
        documentURIs.map(async (fileUri, index) => {
          const uploadedLink = await uploadDocmmentToS3(fileUri);
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
  //         const uploadedLink = await uploadDocmmentToS3(fileUri);

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
          const uploadedLink = await uploadDocmmentToS3(fileUri);
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
    uploadBlobToS3,
    handleRegister,
    uploadFiles,
    uploadFilestoS3,
    uploadMultipleFiles,
    uploadDocmmentToS3,
    uploadAllDocuments,
    uploadDocArray,
    uploadimageToS3,
    handleUpdateSeal,
    handleUpdatecertificate,
  };
};

export default useRegister;
