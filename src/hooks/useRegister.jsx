import {useMutation} from '@apollo/client';
import {REGISTER_USER} from '../../request/mutations/register.mutation';
import {compressImage} from '../utils/ImageResizer';
import {uploadDirectOnS3} from '../utils/s3Helper';
import DocumentPicker, {types} from 'react-native-document-picker';
import React, {useCallback} from 'react';

const useRegister = () => {
  const [register] = useMutation(REGISTER_USER);

  const handleCompression = async image => {
    // console.log('handleCompression', image);

    try {
      const compressedImage = await compressImage(image);
      // console.log(compressImage);
      return compressedImage;
    } catch (error) {
      console.error(error);
    }
  };

  const uploadBlobToS3 = async imageUri => {
    // console.log('uploadBlobToS3', imageUri);

    const title = 'Profile Pictures';
    const type = 'images';
    const url = await uploadDirectOnS3({
      file: imageUri,
      title: title,
      type: type,
    });
    // console.log('uploadBlobToS3', url);
    return url;
  };
  const uploadFilestoS3 = async (fileUri, agentName) => {
    console.log('uploadBlobToS3', fileUri, agentName);

    const title = 'Documents';
    const type = agentName;
    const url = await uploadDirectOnS3({
      file: fileUri,
      title: title,
      type: type,
    });
    console.log('uploadBlobToS3', url);
    return url;
  };

  const handleRegister = async variables => {
    try {
      const request = {
        variables: {
          ...variables,
        },
      };
      console.log('Handle Request', request);
      const {data} = await register(request);
      console.log('After API', data);
      if (data?.register?.status === '201') {
        console.log('Registered');
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
      const response = await DocumentPicker.pickSingle({
        presentationStyle: 'fullScreen',
      });
      return response.uri;
    } catch (err) {
      console.warn(err);
    }
  }, []);

  return {
    handleCompression,
    uploadBlobToS3,
    handleRegister,
    uploadFiles,
    uploadFilestoS3,
  };
};

export default useRegister;
