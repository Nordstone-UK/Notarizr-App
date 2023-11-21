import S3 from 'aws-sdk/clients/s3';
import RNFetchBlob from 'rn-fetch-blob';
import RNFS from 'react-native-fs';
import {decode} from 'base64-arraybuffer';
import {uriToBlob} from './ImagePicker';
const {Buffer} = require('buffer');

const signatureVersion = 'v4';
const accessKeyId = 'AKIAYMBF2K7JBUCNVT76';
const secretAccessKey = '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';

const MUNROE_BUCKET_NAME = 'notarizr-app-data';
interface UploadFileOptions {
  file: any;
  title: string;
  type: string;
}

const uploadDirectOnS3 = async ({
  file,
  title,
  type,
}: UploadFileOptions): Promise<any> => {
  const s3bucket = new S3({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    signatureVersion: signatureVersion,
  });
  // const contentType = file.mime;
  // const contentDisposition = `inline;filename="${file.path}"`;

  // const base64 = await RNFS.readFile(file.path, 'base64');
  // const arrayBuffer = decode(base64);
  const blob = await uriToBlob(file);

  const keyName = `${type}/${title}/${file._data.name}`;
  const params = {
    Bucket: MUNROE_BUCKET_NAME,
    Key: keyName,
    Body: file,
  };

  try {
    const {Location} = await s3bucket.upload(params).promise();
    return Location;
  } catch (err) {
    throw err;
  }
};
const uploadDocumentsOnS3 = async ({
  file,
  title,
  type,
}: UploadFileOptions): Promise<any> => {
  const fileContent = await RNFetchBlob.fs.readFile(file, 'base64');
  const s3bucket = new S3({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    signatureVersion: signatureVersion,
  });
  const blobData = await uriToBlob(file);

  const blob = blobData._data;

  const keyName = `${type}/${title}/${blob.name}`;
  const params = {
    Bucket: MUNROE_BUCKET_NAME,
    Key: keyName,
    Body: blobData,
  };

  try {
    const {Location} = await s3bucket.upload(params).promise();
    return Location;
  } catch (err) {
    throw err;
  }
};
const uploadImageOnS3 = async ({
  file,
  title,
  type,
}: UploadFileOptions): Promise<any> => {
  const s3bucket = new S3({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    signatureVersion: signatureVersion,
  });

  const keyName = `${type}/${title}/${file.name}`;
  const params = {
    Bucket: MUNROE_BUCKET_NAME,
    Key: keyName,
  };

  try {
    // Step 1: Create a multipart upload
    const {UploadId} = await s3bucket.createMultipartUpload(params).promise();
    const parts = []; // Step 2: Upload parts of the file

    const fileSize = file.size;
    const partSize = 5 * 1024 * 1024; // 5MB per part (adjust as needed)
    let start = 0;
    let partNumber = 1;

    while (start < fileSize) {
      const end = Math.min(start + partSize, fileSize);

      const partParams = {
        ...params,
        PartNumber: partNumber,
        UploadId: UploadId!,
        Body: file.slice(start, end),
      };

      const {ETag} = await s3bucket.uploadPart(partParams).promise();
      parts.push({PartNumber: partNumber, ETag: ETag});

      start = end;
      partNumber++;
    } // Step 3: Complete the multipart upload

    const completeParams = {
      ...params,
      UploadId: UploadId!,
      MultipartUpload: {Parts: parts},
    };

    const {Location} = await s3bucket
      .completeMultipartUpload(completeParams)
      .promise();
    return Location;
  } catch (err) {
    throw err;
  }
};

export {uploadImageOnS3, uploadDirectOnS3, uploadDocumentsOnS3};

export default uploadImageOnS3;
