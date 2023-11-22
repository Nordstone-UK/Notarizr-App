import RNFetchBlob from 'rn-fetch-blob';
import {Platform} from 'react-native';
import Toast from 'react-native-toast-message';

const getFileExtention = fileUrl => {
  return /[.]/.exec(fileUrl) ? /[^.]+$/.exec(fileUrl) : undefined;
};

// export const downloadFile = async url => {
//   const date = new Date();
//   console.log('====================================');
//   console.log(url);
//   console.log('====================================');
//   try {
//     const {dirs} = RNFetchBlob.fs;
//     const downloadDir =
//       Platform.OS === 'ios' ? dirs.DocumentDir : dirs.DownloadDir;
//     const fileName = url.substring(url.lastIndexOf('/') + 1);
//     const downloadPath = `${downloadDir}/${fileName}`;

//     const isDownloadDirExists = await RNFetchBlob.fs.exists(downloadDir);
//     if (!isDownloadDirExists) {
//       await RNFetchBlob.fs.mkdir(downloadDir);
//     }

//     const res = await RNFetchBlob.config({
//       fileCache: true,
//       addAndroidDownloads: {
//         useDownloadManager: true,
//         notification: true,
//         path: downloadPath,
//         description: 'Downloading file...',
//       },
//     }).fetch('GET', url);
//     console.log('====================================');
//     console.log(res);
//     console.log('====================================');
//     console.log('File downloaded to:', res.path());
//   } catch (error) {
//     console.log('Error downloading file:', error);
//   }
// };
download;
export const downloadFile = fileUrl => {
  // Get today's date to add the time suffix in filename
  let date = new Date();
  // File URL which we want to download
  let FILE_URL = fileUrl;
  // Function to get extention of the file url
  let file_ext = getFileExtention(FILE_URL);

  file_ext = '.' + file_ext[0];

  // config: To get response by passing the downloading related options
  // fs: Root directory path to download
  const {config, fs} = RNFetchBlob;
  let RootDir = fs.dirs.DownloadDir;
  let options = {
    fileCache: true,
    addAndroidDownloads: {
      path:
        RootDir +
        '/file_' +
        Math.floor(date.getTime() + date.getSeconds() / 2) +
        file_ext,
      description: 'downloading file...',
      notification: true,
      useDownloadManager: true,
    },
  };
  config(options)
    .fetch('GET', FILE_URL)
    .then(res => {
      console.log('res -> ', JSON.stringify(res));
      Toast.show({
        type: 'success',
        text1: 'File Downloaded Successfully.',
      });
    });
};
