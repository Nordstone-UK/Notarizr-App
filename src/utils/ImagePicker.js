import {PermissionsAndroid} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

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
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
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

      if (isCameraPermitted && isStoragePermitted) {
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

      if (isCameraPermitted && isStoragePermitted) {
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
      // Return the blob
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
