import RNFetchBlob from 'rn-fetch-blob';
import {Platform} from 'react-native';

export const downloadFile = async url => {
  const date = new Date();

  try {
    const {config, fs} = RNFetchBlob;
    const {DownloadDir} = fs.dirs;
    const fileName = url.substring(url.lastIndexOf('/') + 1);
    const fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1);
    const fileMimeType = `application/${fileExtension}`;

    const res = await config({
      path: `${DownloadDir}/${fileName}`,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        mime: fileMimeType,
        path: `${DownloadDir}/me_${Math.floor(
          date.getTime() + date.getSeconds() / 2,
        )}.pdf`,
        description: 'Downloading file...',
      },
      fileCache: true,
    }).fetch('GET', url);

    console.log('File downloaded to:', res.path());
  } catch (error) {
    console.log('Error downloading file:', error);
  }
};
