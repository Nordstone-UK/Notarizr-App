import RNFetchBlob from 'rn-fetch-blob';
import {Platform} from 'react-native';

export const downloadFile = async url => {
  const date = new Date();
  console.log('====================================');
  console.log(url);
  console.log('====================================');
  try {
    const {dirs} = RNFetchBlob.fs;
    const downloadDir =
      Platform.OS === 'ios' ? dirs.DocumentDir : dirs.DownloadDir;
    const fileName = url.substring(url.lastIndexOf('/') + 1);
    const downloadPath = `${downloadDir}/${fileName}`;

    const isDownloadDirExists = await RNFetchBlob.fs.exists(downloadDir);
    if (!isDownloadDirExists) {
      await RNFetchBlob.fs.mkdir(downloadDir);
    }

    const res = await RNFetchBlob.config({
      fileCache: true,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        path: `${downloadDir}/me_${Math.floor(
          date.getTime() + date.getSeconds() / 2,
        )}${fileName}`,
        description: 'Downloading file...',
      },
    }).fetch('GET', url);
    console.log('====================================');
    console.log(res);
    console.log('====================================');
    console.log('File downloaded to:', res.path());
  } catch (error) {
    console.log('Error downloading file:', error);
  }
};
