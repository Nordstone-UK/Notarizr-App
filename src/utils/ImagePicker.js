import {PermissionsAndroid} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import {Blob} from 'react-native-blob-util';
const requestCameraPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        // {
        //   title: 'Camera Permission',
        //   message: 'App needs camera permission',
        // },
      );
      // If CAMERA Permission is granted
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  } else return true;
};
const requestExternalWritePermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        // {
        //   title: 'External Storage Write Permission',
        //   message: 'App needs write permission',
        // },
      );
      // If WRITE_EXTERNAL_STORAGE Permission is granted
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      alert('Write permission err', err);
    }
    return false;
  } else return true;
};
const requestMediaAccessPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      alert('Write permission err', err);
    }
    return false;
  } else return true;
};
export const captureImage = async type => {
  return new Promise(async (resolve, reject) => {
    let options = {
      mediaType: type,
      maxWidth: 300,
      maxHeight: 550,
      saveToPhotos: true,
    };

    try {
      let isCameraPermitted = await requestCameraPermission();
      let isStoragePermitted = await requestExternalWritePermission();
      let isMediaPermitted = await requestMediaAccessPermission();

      if (
        (isCameraPermitted && isStoragePermitted) ||
        (isCameraPermitted && isMediaPermitted)
      ) {
        launchCamera(options, response => {
          if (response.didCancel) {
            reject('User cancelled camera picker');
          } else if (response.errorCode === 'camera_unavailable') {
            reject('Camera not available on device');
          } else if (response.errorCode === 'permission') {
            reject('Permission not satisfied');
          } else if (response.errorCode === 'others') {
            reject(response.errorMessage);
          } else {
            const imageUri = response.assets[0]?.uri;
            if (imageUri) {
              resolve(imageUri);
            } else {
              reject('Image URI not available');
            }
          }
        });
      } else {
        reject('Camera or storage permission not granted');
      }
    } catch (error) {
      reject('Error requesting permissions: ' + error);
    }
  });
};
export const chooseFile = async type => {
  return new Promise(async (resolve, reject) => {
    let options = {
      mediaType: type,
      maxWidth: 300,
      maxHeight: 550,
      saveToPhotos: true,
    };

    try {
      let isCameraPermitted = await requestCameraPermission();
      let isStoragePermitted = await requestExternalWritePermission();
      let isMediaPermitted = await requestMediaAccessPermission();

      if (
        (isCameraPermitted && isStoragePermitted) ||
        (isCameraPermitted && isMediaPermitted)
      ) {
        launchImageLibrary(options, response => {
          if (response.didCancel) {
            reject('User cancelled camera picker');
          } else if (response.errorCode === 'camera_unavailable') {
            reject('Camera not available on device');
          } else if (response.errorCode === 'permission') {
            reject('Permission not satisfied');
          } else if (response.errorCode === 'others') {
            reject(response.errorMessage);
          } else {
            const imageUri = response.assets[0]?.uri;
            if (imageUri) {
              resolve(imageUri);
            } else {
              reject('Image URI not available');
            }
          }
        });
      } else {
        reject('Camera or storage permission not granted');
      }
    } catch (error) {
      reject('Error requesting permissions: ' + error);
    }
  });
};
export const uriToBlob = uri => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function () {
      reject(new Error('uriToBlob failed'));
    };
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);

    xhr.send(null);
  });
};
export const convertToJsonObject = inputArray => {
  const jsonArray = inputArray.map((url, index) => {
    return {[`document${index + 1}`]: url};
  });

  return JSON.stringify(jsonArray, null, 2);
};
export const convertURIsToBase64 = async uris => {
  try {
    const base64Array = await Promise.all(
      uris.map(async uri => {
        const response = await fetch(uri);
        const blob = await response.blob();
        return await convertBlobToBase64(blob);
      }),
    );

    return base64Array;
  } catch (error) {
    console.error('Error converting URIs to base64:', error);
    return [];
  }
};
export const handleConvertToBase64 = async imageUris => {
  console.log('Image URIs:', imageUris);
  Promise.all(
    imageUris.map(uri => {
      return RNFS.readFile(uri, 'base64')
        .then(fileContent => {
          const blob = Blob.build(fileContent, {type: 'image/jpeg'});
          return Blob.toString(blob, 'base64');
        })
        .catch(error => {
          console.log('Error reading file:', error);
          return null;
        });
    }),
  )
    .then(base64Array => {
      console.log('Base64 Array:', base64Array);
      // Perform your desired actions with the base64 array
    })
    .catch(error => {
      console.log('Error converting images to base64:', error);
    });
};
