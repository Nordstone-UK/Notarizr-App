import {Image} from 'react-native';
import Compressor from 'compressorjs';

const useCompress = () => {
  const compressImages = (image: Image): Blob | undefined => {
    try {
      // Compress the image directly
      const compressedResult = new Compressor(image, {
        quality: 0.9,
        success: (result: Blob) => {
          // Handle the compressed result here if needed
        },
        error: (error: Error) => {
          console.error('Image compression failed:', error);
        },
      });

      // Return the compressed Blob
      return compressedResult;
    } catch (error) {
      console.error('Image compression failed:', error);
      return undefined;
    }
  };

  return {compressImages};
};

export default useCompress;
