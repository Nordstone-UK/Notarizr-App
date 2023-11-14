import {Linking} from 'react-native';

const useCustomerSuport = () => {
  const phoneNumber = '+447893983206';
  const handleCallSupport = () => {
    const url = `tel:${phoneNumber}`;
    Linking.openURL(url);
  };
  return {
    handleCallSupport,
  };
};

export default useCustomerSuport;
