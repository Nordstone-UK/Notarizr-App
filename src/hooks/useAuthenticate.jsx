import {useMutation} from '@apollo/client';
import {CREATE_AUTHENTICATION} from '../../request/mutations/createAuthenctication.mutation';
import {CONSENT_AUTHENTICATION} from '../../request/mutations/consentAuthenctication.mutation';
import {TEST_AUTHENCATION} from '../../request/mutations/testAuthenticationResult.mutation';
import {UPLOAD_AUTH_USER_ID} from '../../request/mutations/uploadAuthUserID.mutation';
import {UPLOAD_AUTH_USER_PASSPORT} from '../../request/mutations/uploadAuthUserPassport.mutation';

const useAuthenticate = () => {
  const [createAuthentication] = useMutation(CREATE_AUTHENTICATION);
  const [consentAuthenctiation] = useMutation(CONSENT_AUTHENTICATION);
  const [testAuthencation] = useMutation(TEST_AUTHENCATION);
  const [uploadAuthUserID] = useMutation(UPLOAD_AUTH_USER_ID);
  const [uploadAuthUserPassport] = useMutation(UPLOAD_AUTH_USER_PASSPORT);

  const registerAuthUser = async () => {
    try {
      const response = await createAuthentication();
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };
  const consentAuth = async (Name, UserID) => {
    const requset = {
      variables: {fullName: Name, userAccessCode: UserID},
    };
    try {
      const response = await consentAuthenctiation(requset);
      console.log(response?.data);
    } catch (error) {
      console.log(error);
    }
  };
  const testAuth = async () => {
    try {
      const response = await testAuthencation();
      console.log('console.lorresdf', response?.data);
      return response?.data?.testAuthenticationResult?.status;
    } catch (error) {
      console.log(error);
    }
  };
  const uploadUserID = async (userID, PicFront, PicBack, Country) => {
    const request = {
      variables: {
        userAccessCode: userID,
        idFront: PicFront,
        idBack: PicBack,
        country: Country,
      },
    };
    try {
      // console.log('requestttt', request);
      const response = await uploadAuthUserID(request);
      console.log(response?.data);
    } catch (error) {
      console.log('errrr', error);
    }
  };
  const uploadUserPassport = async (uesrID, Pic) => {
    const request = {
      variables: {
        userAccessCode: uesrID,
        idFront: Pic,
      },
    };
    try {
      const response = await uploadAuthUserPassport(request);
      console.log(response?.data);
    } catch (error) {
      console.log(error);
    }
  };
  return {
    registerAuthUser,
    consentAuth,
    testAuth,
    uploadUserID,
    uploadUserPassport,
  };
};

export default useAuthenticate;
