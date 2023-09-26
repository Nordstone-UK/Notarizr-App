import {Image} from 'react-native';
import Compressor from 'compressorjs';

const useCompress = () => {
  const compressImages = async (image: Image): Promise<Blob | undefined> => {
    try {
      const compressedResult = await new Promise<Blob>((resolve, reject) => {
        new Compressor(image, {
          quality: 0.9,
          success: (result: Blob) => resolve(result),
          error: (error: Error) => reject(error),
        });
      });
      return compressedResult;
    } catch (error) {
      console.error('Image compression failed:', error);
    }
  };

  return {compressImages};
};

export default useCompress;
