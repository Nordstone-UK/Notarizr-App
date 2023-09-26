import ImageResizer from 'react-native-image-resizer';
import {uriToBlob} from './ImagePicker';

export const compressImage = imagePath => {
  return new Promise((resolve, reject) => {
    ImageResizer.createResizedImage(imagePath, 800, 800, 'JPEG', 80) // Adjust the dimensions and compression quality as desired
      .then(compressedImage => {
        const BLOB = uriToBlob(compressedImage.uri);

        resolve(BLOB);
      })
      .catch(error => {
        reject('Image compression failed: ' + error);
      });
  });
};
