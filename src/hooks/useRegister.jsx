import {useMutation} from '@apollo/client';
import {REGISTER_USER} from '../../request/mutations/register.mutation';
import {compressImage} from '../utils/ImageResizer';
import {uploadDirectOnS3} from '../utils/s3Helper';

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

  const handleRegister = async variables => {
    try {
      const request = {
        variables: {
          ...variables,
        },
      };
      console.log('Handle Request', request);
      const {data} = await register(request);
      console.log('handle Register', data);
      if (data?.register?.status === 201) {
        console.log('Registered');
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  const uploadFiles = () => {};

  return {handleCompression, uploadBlobToS3, handleRegister};
};

export default useRegister;
// const handleRegister = async () => {
//   const imageBlob = await handleCompression();
//   const url = await uploadBlobToS3(imageBlob);

//   const params = {
//     ...reduxVariables,
//     profilePicture: url,
//   };

//   await register(params);
// };
