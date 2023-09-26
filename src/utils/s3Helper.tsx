import S3 from 'aws-sdk/clients/s3';

// import S3 from 'react-aws-s3'
const signatureVersion = 'v4';
const accessKeyId = 'AKIA2FEB4ZRQPG2ESKDT';
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

export {uploadImageOnS3, uploadDirectOnS3};

export default uploadImageOnS3;
